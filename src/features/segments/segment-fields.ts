// Field/comparator metadata + AST<->wire coercion for the segment builder.
// Single source of UI truth, kept in lockstep with the backend whitelist
// (crm_api/services/segment_compiler.py) which is mirrored in lib/schemas/types.ts.
import {
  FIELD_COMPARATORS,
  SEGMENT_FIELDS,
  type Comparator,
  type SegmentField,
  type SegmentGroup,
  type SegmentRule,
} from "@/lib/schemas/types";
import type { RuleGroup, RuleLeaf } from "@/lib/schemas/segment";

export { FIELD_COMPARATORS, SEGMENT_FIELDS };

export const FIELD_LABELS: Record<SegmentField, string> = {
  total_spend: "Total spend",
  order_count: "Order count",
  city: "City",
  email: "Email",
  last_order_at: "Last order",
  created_at: "Created",
};

export const COMPARATOR_LABELS: Record<Comparator, string> = {
  eq: "is",
  neq: "is not",
  gt: "greater than",
  gte: "at least",
  lt: "less than",
  lte: "at most",
  in_list: "is any of",
  is_set: "is set",
  is_not_set: "is not set",
  older_than_days: "older than",
  within_days: "within",
};

export type ValueKind = "none" | "number" | "days" | "text" | "list";

// Drives which input the row renders and how the value is coerced for the wire.
export function valueKind(field: SegmentField, cmp: Comparator): ValueKind {
  if (cmp === "is_set" || cmp === "is_not_set") return "none";
  if (cmp === "in_list") return "list";
  if (cmp === "older_than_days" || cmp === "within_days") return "days";
  if (field === "total_spend" || field === "order_count") return "number";
  return "text";
}

export function defaultValue(
  field: SegmentField,
  cmp: Comparator,
): SegmentRule["value"] {
  const k = valueKind(field, cmp);
  if (k === "none") return null;
  if (k === "list") return [];
  return ""; // number/days/text start empty (string-controlled input)
}

export function newRule(field: SegmentField = "total_spend"): SegmentRule {
  const comparator = FIELD_COMPARATORS[field][0];
  return {
    id: crypto.randomUUID(),
    field,
    comparator,
    value: defaultValue(field, comparator),
  };
}

export function newGroup(operator: "AND" | "OR" = "AND"): SegmentGroup {
  return { id: crypto.randomUUID(), operator, children: [newRule()] };
}

export function isGroup(
  node: SegmentRule | SegmentGroup,
): node is SegmentGroup {
  return "children" in node;
}

// ── completeness (gate preview/save so we never send a 422-bound payload) ──
export function ruleComplete(rule: SegmentRule): boolean {
  const k = valueKind(rule.field as SegmentField, rule.comparator);
  if (k === "none") return true;
  if (k === "list") return Array.isArray(rule.value) && rule.value.length > 0;
  if (k === "number" || k === "days") {
    return (
      rule.value !== "" &&
      rule.value != null &&
      !Number.isNaN(Number(rule.value))
    );
  }
  return typeof rule.value === "string" && rule.value.trim().length > 0;
}

export function groupComplete(group: SegmentGroup): boolean {
  if (group.children.length === 0) return false;
  return group.children.every((c) =>
    isGroup(c) ? groupComplete(c) : ruleComplete(c),
  );
}

export function leafCount(group: SegmentGroup): number {
  return group.children.reduce(
    (n, c) => n + (isGroup(c) ? leafCount(c) : 1),
    0,
  );
}

// ── UI AST -> backend wire AST (with type coercion) ──
function leafToWire(rule: SegmentRule): RuleLeaf {
  const k = valueKind(rule.field as SegmentField, rule.comparator);
  if (k === "none") return { field: rule.field, cmp: rule.comparator };
  if (k === "number" || k === "days") {
    // backend _as_days requires an int; _as_number accepts str|int|float
    return { field: rule.field, cmp: rule.comparator, value: Number(rule.value) };
  }
  return { field: rule.field, cmp: rule.comparator, value: rule.value };
}

export function definitionFromAst(group: SegmentGroup): RuleGroup {
  return {
    op: group.operator,
    rules: group.children.map((c) =>
      isGroup(c) ? definitionFromAst(c) : leafToWire(c),
    ),
  };
}

// ── backend wire AST -> UI AST (fill builder from AI / saved segment) ──
type WireLeaf = { field: string; cmp: string; value?: unknown };
type WireGroup = { op: "AND" | "OR"; rules: Array<WireGroup | WireLeaf> };

function leafFromWire(r: WireLeaf): SegmentRule {
  const field = r.field as SegmentField;
  const cmp = r.cmp as Comparator;
  const k = valueKind(field, cmp);
  let value: SegmentRule["value"];
  if (k === "none") value = null;
  else if (k === "list") value = Array.isArray(r.value) ? (r.value as string[]) : [];
  else value = r.value == null ? "" : String(r.value);
  return { id: crypto.randomUUID(), field, comparator: cmp, value };
}

export function astFromDefinition(def: unknown): SegmentGroup {
  const g = def as WireGroup;
  const rules = Array.isArray(g?.rules) ? g.rules : [];
  return {
    id: crypto.randomUUID(),
    operator: g?.op === "OR" ? "OR" : "AND",
    children: rules.map((r) =>
      "rules" in (r as object)
        ? astFromDefinition(r)
        : leafFromWire(r as WireLeaf),
    ),
  };
}

// Human label for a wire per-rule-impact entry. Backend sends
// `${field} ${cmp} ${value!r}`; we re-label using the UI dictionaries.
export function prettyRuleLabel(raw: string): string {
  const [field, cmp, ...rest] = raw.split(" ");
  const f = FIELD_LABELS[field as SegmentField] ?? field;
  const c = COMPARATOR_LABELS[cmp as Comparator] ?? cmp;
  const v = rest.join(" ").replace(/^['"]|['"]$/g, "");
  return v ? `${f} ${c} ${v}` : `${f} ${c}`;
}
