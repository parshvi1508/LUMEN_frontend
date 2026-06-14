"use client";

import { Plus, X, FolderPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COMPARATOR_LABELS,
  FIELD_COMPARATORS,
  FIELD_LABELS,
  SEGMENT_FIELDS,
  defaultValue,
  isGroup,
  newGroup,
  newRule,
  valueKind,
} from "./segment-fields";
import type {
  Comparator,
  SegmentField,
  SegmentGroup,
  SegmentRule,
} from "@/lib/schemas/types";

const MAX_DEPTH = 5; // mirrors backend segment_compiler MAX_DEPTH

const selectCls =
  "h-8 rounded-lg border border-border bg-surface-2 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40";

export function RuleBuilder({
  value,
  onChange,
}: {
  value: SegmentGroup;
  onChange: (g: SegmentGroup) => void;
}) {
  return <GroupEditor node={value} onChange={onChange} depth={0} />;
}

function GroupEditor({
  node,
  onChange,
  onRemove,
  depth,
}: {
  node: SegmentGroup;
  onChange: (g: SegmentGroup) => void;
  onRemove?: () => void;
  depth: number;
}) {
  function updateChild(i: number, child: SegmentRule | SegmentGroup) {
    onChange({
      ...node,
      children: node.children.map((c, idx) => (idx === i ? child : c)),
    });
  }
  function removeChild(i: number) {
    onChange({ ...node, children: node.children.filter((_, idx) => idx !== i) });
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-1 p-3 space-y-2.5",
        depth > 0 && "bg-surface-2/40",
      )}
    >
      {/* group header: AND/OR toggle */}
      <div className="flex items-center justify-between gap-2">
        <div
          role="group"
          aria-label="Match operator"
          className="inline-flex rounded-lg border border-border bg-surface-2 p-0.5"
        >
          {(["AND", "OR"] as const).map((op) => (
            <button
              key={op}
              type="button"
              aria-pressed={node.operator === op}
              onClick={() => onChange({ ...node, operator: op })}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                node.operator === op
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {op}
            </button>
          ))}
          <span className="px-2 py-1 text-xs text-muted-foreground">
            {node.operator === "AND"
              ? "match all of these"
              : "match any of these"}
          </span>
        </div>
        {onRemove && (
          <button
            type="button"
            aria-label="Remove group"
            onClick={onRemove}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {/* children */}
      <div className="space-y-2">
        {node.children.map((child, i) => (
          <div key={isGroup(child) ? child.id : child.id} className="space-y-2">
            {i > 0 && (
              <div className="pl-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {node.operator}
              </div>
            )}
            {isGroup(child) ? (
              <GroupEditor
                node={child}
                depth={depth + 1}
                onChange={(g) => updateChild(i, g)}
                onRemove={() => removeChild(i)}
              />
            ) : (
              <RuleRow
                rule={child}
                onChange={(r) => updateChild(i, r)}
                onRemove={() => removeChild(i)}
              />
            )}
          </div>
        ))}
        {node.children.length === 0 && (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            Empty group - add a rule.
          </p>
        )}
      </div>

      {/* footer: add controls */}
      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={() =>
            onChange({ ...node, children: [...node.children, newRule()] })
          }
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Plus className="size-3.5" aria-hidden />
          Add rule
        </button>
        {depth + 1 < MAX_DEPTH && (
          <button
            type="button"
            onClick={() =>
              onChange({ ...node, children: [...node.children, newGroup()] })
            }
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <FolderPlus className="size-3.5" aria-hidden />
            Add group
          </button>
        )}
      </div>
    </div>
  );
}

function RuleRow({
  rule,
  onChange,
  onRemove,
}: {
  rule: SegmentRule;
  onChange: (r: SegmentRule) => void;
  onRemove: () => void;
}) {
  const field = rule.field as SegmentField;
  const comparators = FIELD_COMPARATORS[field] ?? [];
  const kind = valueKind(field, rule.comparator);

  function setField(next: SegmentField) {
    const cmp = FIELD_COMPARATORS[next][0];
    onChange({
      ...rule,
      field: next,
      comparator: cmp,
      value: defaultValue(next, cmp),
    });
  }
  function setComparator(next: Comparator) {
    onChange({ ...rule, comparator: next, value: defaultValue(field, next) });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2">
      {/* field */}
      <select
        aria-label="Field"
        value={field}
        onChange={(e) => setField(e.target.value as SegmentField)}
        className={selectCls}
      >
        {SEGMENT_FIELDS.map((f) => (
          <option key={f} value={f}>
            {FIELD_LABELS[f]}
          </option>
        ))}
      </select>

      {/* comparator */}
      <select
        aria-label="Comparator"
        value={rule.comparator}
        onChange={(e) => setComparator(e.target.value as Comparator)}
        className={selectCls}
      >
        {comparators.map((c) => (
          <option key={c} value={c}>
            {COMPARATOR_LABELS[c]}
          </option>
        ))}
      </select>

      {/* value */}
      <ValueInput rule={rule} kind={kind} onChange={onChange} />

      <button
        type="button"
        aria-label="Remove rule"
        onClick={onRemove}
        className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}

function ValueInput({
  rule,
  kind,
  onChange,
}: {
  rule: SegmentRule;
  kind: ReturnType<typeof valueKind>;
  onChange: (r: SegmentRule) => void;
}) {
  if (kind === "none") {
    return <span className="text-xs text-muted-foreground">(no value)</span>;
  }
  if (kind === "list") {
    const text = Array.isArray(rule.value) ? rule.value.join(", ") : "";
    return (
      <Input
        aria-label="Values (comma separated)"
        placeholder="Delhi, Mumbai"
        value={text}
        onChange={(e) =>
          onChange({
            ...rule,
            value: e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        className="w-44"
      />
    );
  }
  if (kind === "number" || kind === "days") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <Input
          type="number"
          inputMode="numeric"
          aria-label="Value"
          value={typeof rule.value === "string" ? rule.value : String(rule.value ?? "")}
          onChange={(e) => onChange({ ...rule, value: e.target.value })}
          className="w-28"
        />
        {kind === "days" && (
          <span className="text-xs text-muted-foreground">days</span>
        )}
      </div>
    );
  }
  // text
  return (
    <Input
      aria-label="Value"
      placeholder="Mumbai"
      value={typeof rule.value === "string" ? rule.value : ""}
      onChange={(e) => onChange({ ...rule, value: e.target.value })}
      className="w-40"
    />
  );
}
