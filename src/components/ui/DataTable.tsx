"use client";

import { type ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SKELETON_ROW_COUNT = 8;

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  onRowClick?: (row: TData) => void;
  // Controlled - caller owns sorting state (server-side or client-side)
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  // Controlled pagination (server-side)
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  totalRows?: number;
  // Sorting mode - defaults to server-side when an onSortingChange is supplied.
  // Pass false to sort the loaded rows client-side (e.g. derived columns).
  manualSorting?: boolean;
  // Row selection (opt-in)
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData, index: number) => string;
  // Per-row className for visual rank-ordering (tier rails, tints).
  rowClassName?: (row: TData) => string;
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (sorted === "asc") return <ChevronUp className="size-3.5 ml-1 shrink-0" aria-hidden />;
  if (sorted === "desc") return <ChevronDown className="size-3.5 ml-1 shrink-0" aria-hidden />;
  return <ChevronsUpDown className="size-3.5 ml-1 shrink-0 opacity-40" aria-hidden />;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyState,
  onRowClick,
  sorting,
  onSortingChange,
  pagination,
  onPaginationChange,
  pageCount,
  totalRows,
  manualSorting,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  rowClassName,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: manualSorting ?? !!onSortingChange,
    enableRowSelection,
    getRowId,
    pageCount: pageCount ?? -1,
    state: {
      ...(sorting != null ? { sorting } : {}),
      ...(pagination != null ? { pagination } : {}),
      ...(rowSelection != null ? { rowSelection } : {}),
    },
    onSortingChange,
    onPaginationChange,
    onRowSelectionChange,
  });

  const rows = table.getRowModel().rows;
  const isEmpty = !isLoading && rows.length === 0;

  // Pagination display
  const currentPage = pagination?.pageIndex ?? 0;
  const pageSize = pagination?.pageSize ?? data.length;
  const startRow = currentPage * pageSize + 1;
  const endRow = Math.min(startRow + pageSize - 1, totalRows ?? data.length);
  const total = totalRows ?? data.length;
  const canPrev = currentPage > 0;
  const canNext = pageCount != null ? currentPage < pageCount - 1 : false;

  return (
    <div className="space-y-3">
      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      scope="col"
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : canSort
                              ? "none"
                              : undefined
                      }
                      className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center gap-0 cursor-pointer select-none",
                            "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                            "hover:text-foreground transition-colors",
                          )}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <SortIcon sorted={sorted} />
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {/* Loading skeleton rows */}
            {isLoading &&
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
                <TableRow key={`skel-${i}`} className="animate-pulse">
                  {columns.map((_, ci) => (
                    <TableCell key={ci}>
                      <Skeleton className="h-4 w-full max-w-[120px]" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {/* Empty state */}
            {isEmpty && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  {emptyState ?? (
                    <span className="text-sm text-muted-foreground">No results.</span>
                  )}
                </TableCell>
              </TableRow>
            )}

            {/* Data rows */}
            {!isLoading &&
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row.original),
                    row.getIsSelected() && "bg-primary/5",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls - only shown when pagination is active */}
      {pagination != null && pageCount != null && pageCount > 1 && (
        <div className="flex items-center justify-between px-1 text-sm text-muted-foreground">
          <span>
            {total > 0
              ? `Showing ${startRow}-${endRow} of ${total}`
              : "No results"}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!canPrev}
              aria-label="Previous page"
              onClick={() =>
                onPaginationChange?.({ pageIndex: currentPage - 1, pageSize })
              }
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 tabular-nums">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={!canNext}
              aria-label="Next page"
              onClick={() =>
                onPaginationChange?.({ pageIndex: currentPage + 1, pageSize })
              }
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
