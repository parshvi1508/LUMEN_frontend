"use client";

import {
  COMPARATOR_LABELS,
  FIELD_LABELS,
} from "@/features/segments/segment-fields";
import type { Comparator, SegmentField } from "@/lib/schemas/types";

type WireLeaf = { field: string; cmp: string; value?: unknown };
type WireGroup = { op: "AND" | "OR"; rules: Array<WireGroup | WireLeaf> };

function isWireGroup(n: WireGroup | WireLeaf): n is WireGroup {
  return "rules" in n;
}

function leafText(leaf: WireLeaf): string {
  const f = FIELD_LABELS[leaf.field as SegmentField] ?? leaf.field;
  const c = COMPARATOR_LABELS[leaf.cmp as Comparator] ?? leaf.cmp;
  const v = Array.isArray(leaf.value)
    ? leaf.value.join(", ")
    : leaf.value == null
      ? ""
      : String(leaf.value);
  return v ? `${f} ${c} ${v}` : `${f} ${c}`;
}

function Group({ group, depth }: { group: WireGroup; depth: number }) {
  return (
    <ul className={depth > 0 ? "ml-3 border-l border-border pl-3" : ""}>
      {group.rules.map((r, i) => (
        <li key={i} className="py-0.5">
          {i > 0 && (
            <span className="mr-1 text-[10px] font-semibold uppercase text-muted-foreground">
              {group.op}
            </span>
          )}
          {isWireGroup(r) ? (
            <Group group={r} depth={depth + 1} />
          ) : (
            <span className="text-sm text-foreground/90">{leafText(r)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

// Read-only, human-readable view of a wire-format rule AST.
export function SegmentRulesView({ definition }: { definition: unknown }) {
  const g = definition as WireGroup;
  if (!g || !Array.isArray(g.rules)) {
    return <p className="text-sm text-muted-foreground">No rules.</p>;
  }
  return <Group group={g} depth={0} />;
}
