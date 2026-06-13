// Maps the UI builder AST (SegmentAST: {operator, children, comparator, id})
// to the backend wire AST (RuleGroup: {op, rules, cmp}). The two shapes differ;
// the API only accepts the wire shape (crm_api/schemas/segments.py).
import type { RuleGroup, RuleLeaf } from "@/lib/schemas/segment";
import type {
  SegmentAST,
  SegmentGroup,
  SegmentRule,
} from "@/lib/schemas/types";

function isGroup(node: SegmentRule | SegmentGroup): node is SegmentGroup {
  return "children" in node;
}

export function ruleToWire(rule: SegmentRule): RuleLeaf {
  // is_set / is_not_set take no operand on the backend — omit value
  if (rule.comparator === "is_set" || rule.comparator === "is_not_set") {
    return { field: rule.field, cmp: rule.comparator };
  }
  return { field: rule.field, cmp: rule.comparator, value: rule.value };
}

export function groupToWire(group: SegmentGroup): RuleGroup {
  return {
    op: group.operator,
    rules: group.children.map((child) =>
      isGroup(child) ? groupToWire(child) : ruleToWire(child),
    ),
  };
}

// Builder root -> wire definition, ready for previewSegment / createSegment.
export const toWireAst = (ast: SegmentAST): RuleGroup => groupToWire(ast);
