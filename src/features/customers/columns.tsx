"use client";

import { useEffect, useRef } from "react";
import type { ColumnDef, Table, Row } from "@tanstack/react-table";
import type { Customer } from "@/lib/schemas/customer";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { deriveTier, TIER_RANK } from "@/lib/customer-tier";
import { TierBadge } from "./TierBadge";
import { RowActions } from "./RowActions";

export interface CustomerColumnHandlers {
  onView: (c: Customer) => void;
  onRowAction: (c: Customer, action: "segment" | "export" | "email") => void;
}

function HeaderCheckbox({ table }: { table: Table<Customer> }) {
  const ref = useRef<HTMLInputElement>(null);
  const some = table.getIsSomePageRowsSelected();
  const all = table.getIsAllPageRowsSelected();
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some && !all;
  }, [some, all]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={all}
      onChange={table.getToggleAllPageRowsSelectedHandler()}
      onClick={(e) => e.stopPropagation()}
      aria-label="Select all rows on this page"
      className="size-4 cursor-pointer rounded border-border accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    />
  );
}

function RowCheckbox({ row }: { row: Row<Customer> }) {
  return (
    <input
      type="checkbox"
      checked={row.getIsSelected()}
      onChange={row.getToggleSelectedHandler()}
      onClick={(e) => e.stopPropagation()}
      aria-label={`Select ${row.original.name}`}
      className="size-4 cursor-pointer rounded border-border accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    />
  );
}

export function getCustomerColumns(
  handlers: CustomerColumnHandlers,
): ColumnDef<Customer>[] {
  return [
    {
      id: "select",
      header: ({ table }) => <HeaderCheckbox table={table} />,
      cell: ({ row }) => <RowCheckbox row={row} />,
      enableSorting: false,
      size: 36,
    },
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "city",
      header: "City",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.city || "-"}</span>
      ),
    },
    {
      id: "tier",
      header: "Tier",
      enableSorting: true,
      // Sort by priority rank (VIP → at-risk → active → churned).
      accessorFn: (c) => TIER_RANK[deriveTier(c)],
      sortingFn: "basic",
      cell: ({ row }) => <TierBadge tier={deriveTier(row.original)} />,
    },
    {
      accessorKey: "total_spend",
      header: "Total Spend",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">
          {formatCurrency(row.original.total_spend)}
        </span>
      ),
    },
    {
      accessorKey: "order_count",
      header: "Orders",
      enableSorting: true,
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.order_count}
        </span>
      ),
    },
    {
      accessorKey: "last_order_at",
      header: "Last Order",
      enableSorting: true,
      cell: ({ row }) =>
        row.original.last_order_at ? (
          <span className="text-muted-foreground">
            {formatRelativeTime(row.original.last_order_at)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      size: 44,
      cell: ({ row }) => (
        <RowActions
          customer={row.original}
          onView={handlers.onView}
          onRowAction={handlers.onRowAction}
        />
      ),
    },
  ];
}
