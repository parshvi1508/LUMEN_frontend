"use client";

import { Suspense, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CustomerTable } from "@/features/customers/CustomerTable";
import { CsvUpload } from "@/features/customers/CsvUpload";
import { CustomerDetailSheet } from "@/features/customers/CustomerDetailSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/lib/schemas/customer";
import { Upload, X } from "lucide-react";

export default function CustomersPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function openSheet(customer: Customer) {
    setSelectedCustomer(customer);
    setSheetOpen(true);
  }

  function closeSheet() {
    setSheetOpen(false);
    // Keep customer in state until animation finishes so content
    // doesn't flash away before the panel is off-screen
    setTimeout(() => setSelectedCustomer(null), 250);
  }

  return (
    <>
      {/* ── Page header ── */}
      <PageHeader
        title="Customers"
        description="Your full customer list, ranked by tier. Click any row to see the profile."
        actions={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-medium text-foreground shadow-card transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            <Upload className="size-4" aria-hidden />
            Import
          </button>
        }
      />

      {/* ── Table ── */}
      <div className="px-6 md:px-8 py-6">
        <Suspense fallback={<TableFallback />}>
          <CustomerTable
            onUploadClick={() => setUploadOpen(true)}
            onRowClick={openSheet}
          />
        </Suspense>
      </div>

      {/* ── CSV Upload dialog ── */}
      <Dialog.Root open={uploadOpen} onOpenChange={setUploadOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
          <Dialog.Popup
            aria-labelledby="upload-dialog-title"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background shadow-2xl transition-all duration-150 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 data-[starting-style]:opacity-0 data-[starting-style]:scale-95 focus:outline-none"
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-0">
              <div>
                <Dialog.Title
                  id="upload-dialog-title"
                  className="text-base font-semibold text-foreground"
                >
                  Import customers
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
                  Upload a CSV to add or update your customer list.
                </Dialog.Description>
              </div>
              <Dialog.Close
                aria-label="Close import dialog"
                className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" aria-hidden />
              </Dialog.Close>
            </div>

            {/* Dialog body */}
            <div className="px-6 py-5">
              <CsvUpload onClose={() => setUploadOpen(false)} />
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Customer detail sheet ── */}
      <CustomerDetailSheet
        customer={selectedCustomer}
        open={sheetOpen}
        onOpenChange={(open) => {
          if (!open) closeSheet();
        }}
      />
    </>
  );
}

function TableFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-full max-w-xs" />
      <div className="rounded-lg border border-border">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1 max-w-[180px]" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
