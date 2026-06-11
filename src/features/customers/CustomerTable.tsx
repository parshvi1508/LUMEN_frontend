"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type {
  SortingState,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";
import { useCustomers } from "@/hooks/useCustomers";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/input";
import { getCustomerColumns } from "./columns";
import { TierBadge } from "./TierBadge";
import { ActionComingSoon, type ComingSoonAction } from "./ActionComingSoon";
import type { Customer } from "@/lib/schemas/customer";
import type { ApiError } from "@/lib/api";
import { deriveTier, TIER_META } from "@/lib/customer-tier";
import { exportCustomersCsv } from "@/lib/csv-export";
import { Upload, Users, Search, Wand2, Download, Mail, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

// Row tint by tier — VIP/at-risk pop, churned recedes (rank-ordering, not flat).
const ROW_TINT: Record<ReturnType<typeof deriveTier>, string> = {
  vip: "bg-vip/40 hover:bg-vip/50",
  "at-risk": "bg-warning/40 hover:bg-warning/50",
  active: "",
  churned: "opacity-65",
};

interface CustomerTableProps {
  onUploadClick: () => void;
  onRowClick: (customer: Customer) => void;
}

export function CustomerTable({ onUploadClick, onRowClick }: CustomerTableProps) {
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(() => searchParams.get("q") ?? "");
  // Default sort surfaces VIP → at-risk → active → churned within the page.
  const [sorting, setSorting] = useState<SortingState>([{ id: "tier", desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [comingSoon, setComingSoon] = useState<{ action: ComingSoonAction; count: number } | null>(null);

  const debouncedSearch = useDebounce(searchInput, 400);

  // Keep the input in sync if the global top-bar search changes ?q=.
  const urlQuery = searchParams.get("q") ?? "";
  useEffect(() => {
    // Sync the local search box when the global top-bar pushes a new ?q=.
    // This is synchronizing React state from an external system (the URL).
    /* eslint-disable react-hooks/set-state-in-effect */
    setSearchInput(urlQuery);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setRowSelection({});
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [urlQuery]);

  const { data, isLoading, isError, error, refetch } = useCustomers({
    search: debouncedSearch || undefined,
    page: pagination.pageIndex,
    pageSize: pagination.pageSize,
  });

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value);
    setPagination((p) => ({ ...p, pageIndex: 0 }));
    setRowSelection({});
  }, []);

  // Reset selection on page change so export/count stay honest per page.
  const handlePagination = useCallback<typeof setPagination>((updater) => {
    setPagination(updater);
    setRowSelection({});
  }, []);

  const rows = useMemo(() => data?.data ?? [], [data]);
  const selectedCustomers = rows.filter((c) => rowSelection[c.id]);

  const handleRowAction = useCallback(
    (c: Customer, action: "segment" | "export" | "email") => {
      if (action === "export") {
        exportCustomersCsv([c], `lumen-${c.external_id}.csv`);
        return;
      }
      setComingSoon({ action, count: 1 });
    },
    [],
  );

  const columns = useMemo(
    () => getCustomerColumns({ onView: onRowClick, onRowAction: handleRowAction }),
    [onRowClick, handleRowAction],
  );

  const rowClassName = useCallback((c: Customer) => ROW_TINT[deriveTier(c)], []);

  const isFirstRun = !isLoading && !isError && data?.total === 0 && !debouncedSearch;
  const isFilteredEmpty = !isLoading && !isError && data?.total === 0 && !!debouncedSearch;

  function emptyContent() {
    if (isFirstRun) {
      return (
        <EmptyState
          icon={<Users className="size-8" />}
          title="No customers yet"
          description="Upload a CSV to import your customer list."
          action={{ label: "Upload CSV", onClick: onUploadClick }}
        />
      );
    }
    if (isFilteredEmpty) {
      return (
        <EmptyState
          icon={<Search className="size-6" />}
          title="No customers match your search"
          description={`No results for "${debouncedSearch}". Try a different name or email.`}
        />
      );
    }
    return undefined;
  }

  if (isError && error) {
    const apiErr = (error as { apiError?: ApiError }).apiError ?? {
      status: 0,
      code: "unknown",
      message: "An unexpected error occurred.",
    };
    return (
      <div className="space-y-4">
        <TableToolbar value={searchInput} onChange={handleSearch} onUploadClick={onUploadClick} />
        <EmptyState
          title="Couldn't load customers"
          description={apiErr.message}
          action={{ label: "Try again", onClick: () => refetch() }}
        />
      </div>
    );
  }

  const selectedCount = Object.keys(rowSelection).length;

  return (
    <div className="space-y-4">
      <TableToolbar value={searchInput} onChange={handleSearch} onUploadClick={onUploadClick} />

      {/* Tier legend — teaches the color system at a glance */}
      {!isLoading && (data?.total ?? 0) > 0 && <TierLegend />}

      <DataTable
        columns={columns}
        data={rows}
        isLoading={isLoading}
        emptyState={emptyContent()}
        onRowClick={onRowClick}
        sorting={sorting}
        onSortingChange={setSorting}
        manualSorting={false}
        pagination={pagination}
        onPaginationChange={handlePagination}
        pageCount={data?.pageCount}
        totalRows={data?.total}
        enableRowSelection
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(c) => c.id}
        rowClassName={rowClassName}
      />

      {/* Sticky bulk action bar */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 md:left-[calc(50%+7rem)]">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface-3 p-1.5 pl-3 shadow-overlay">
            <span className="mr-1 text-sm font-medium text-foreground tabular-nums">
              {selectedCount} selected
            </span>
            <BarButton
              icon={<Wand2 className="size-4" />}
              onClick={() => setComingSoon({ action: "segment", count: selectedCount })}
            >
              Add to segment
            </BarButton>
            <BarButton
              icon={<Download className="size-4" />}
              onClick={() => exportCustomersCsv(selectedCustomers)}
            >
              Export
            </BarButton>
            <BarButton
              icon={<Mail className="size-4" />}
              onClick={() => setComingSoon({ action: "email", count: selectedCount })}
            >
              Email
            </BarButton>
            <button
              type="button"
              onClick={() => setRowSelection({})}
              aria-label="Clear selection"
              className="ml-1 flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      )}

      <ActionComingSoon
        action={comingSoon?.action ?? null}
        count={comingSoon?.count ?? 0}
        onOpenChange={(open) => !open && setComingSoon(null)}
      />
    </div>
  );
}

function BarButton({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </button>
  );
}

function TierLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1">
      {(["vip", "active", "at-risk", "churned"] as const).map((tier) => (
        <div key={tier} className="flex items-center gap-1.5">
          <TierBadge tier={tier} />
          <span className="text-xs text-muted-foreground">{TIER_META[tier].description}</span>
        </div>
      ))}
    </div>
  );
}

function TableToolbar({
  value,
  onChange,
  onUploadClick,
}: {
  value: string;
  onChange: (v: string) => void;
  onUploadClick: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="relative max-w-xs w-full">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search customers…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-8"
          aria-label="Search customers"
        />
      </div>
      <button
        type="button"
        onClick={onUploadClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground shadow-card transition-colors",
          "hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
        )}
      >
        <Upload className="size-4" aria-hidden />
        Upload CSV
      </button>
    </div>
  );
}
