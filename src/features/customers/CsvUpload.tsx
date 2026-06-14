"use client";

import {
  useState,
  useRef,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from "react";
import Papa from "papaparse";
import { useUploadCsv } from "@/hooks/useCustomers";
import { CsvRowSchema } from "@/lib/schemas/customer";
import type { RejectedRow, CsvRow } from "@/lib/schemas/customer";
import { AsyncButton } from "@/components/ui/AsyncButton";
import { isApiError } from "@/lib/api";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

// Canonical fields + the header aliases we auto-detect from real-world exports.
type FieldKey = "name" | "email" | "external_id" | "city" | "total_spend" | "order_count";

const FIELDS: { key: FieldKey; label: string; required: boolean; match: string[] }[] = [
  { key: "name", label: "Name", required: true, match: ["name", "full name", "first name", "customer name"] },
  { key: "email", label: "Email", required: true, match: ["email", "e-mail", "email address"] },
  { key: "external_id", label: "External ID", required: true, match: ["external_id", "id", "customer id", "customer_id", "shopify id"] },
  { key: "city", label: "City", required: false, match: ["city", "town"] },
  { key: "total_spend", label: "Total spend", required: false, match: ["total_spend", "total spent", "spend", "revenue", "total sales", "total"] },
  { key: "order_count", label: "Orders", required: false, match: ["order_count", "orders", "order count", "number of orders", "orders count"] },
];

type Mapping = Record<FieldKey, string | null>;

function norm(h: string) {
  return h.trim().toLowerCase();
}

function autoMap(headers: string[]): Mapping {
  const used = new Set<string>();
  const result = {} as Mapping;
  for (const field of FIELDS) {
    const found = headers.find((h) => {
      if (used.has(h)) return false;
      const n = norm(h);
      return field.match.some((m) => n === m || n.includes(m));
    });
    result[field.key] = found ?? null;
    if (found) used.add(found);
  }
  return result;
}

function remapAndValidate(
  rawRows: Record<string, string>[],
  mapping: Mapping,
): { validRows: CsvRow[]; rejected: RejectedRow[] } {
  const validRows: CsvRow[] = [];
  const rejected: RejectedRow[] = [];
  rawRows.forEach((raw, i) => {
    const mapped: Record<string, string> = {};
    for (const field of FIELDS) {
      const src = mapping[field.key];
      if (src) mapped[field.key] = raw[src];
    }
    const result = CsvRowSchema.safeParse(mapped);
    if (result.success) validRows.push(result.data);
    else
      rejected.push({
        row: i + 2,
        external_id: mapped.external_id,
        errors: result.error.issues.map((iss) => `${iss.path.join(".")}: ${iss.message}`),
        data: raw,
      });
  });
  return { validRows, rejected };
}

function downloadSample() {
  const csv =
    "name,email,external_id,city,total_spend,order_count\n" +
    "Aarav Sharma,aarav@example.com,CUST-1001,Mumbai,18400,6\n" +
    "Diya Patel,diya@example.com,CUST-1002,Ahmedabad,5200,2\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lumen-sample.csv";
  a.click();
  URL.revokeObjectURL(url);
}

type Stage =
  | { id: "idle" }
  | { id: "dragging" }
  | { id: "validating"; fileName: string }
  | { id: "validation-error"; fileName: string; lines: string[] }
  | { id: "mapping"; fileName: string; headers: string[]; rawRows: Record<string, string>[]; mapping: Mapping }
  | { id: "ready"; fileName: string; validRows: CsvRow[]; rejected: RejectedRow[] }
  | { id: "uploading"; fileName: string; progress: number }
  | { id: "success"; created: number; updated: number; rejected: RejectedRow[] }
  | { id: "error"; message: string };

interface CsvUploadProps {
  onClose: () => void;
}

export function CsvUpload({ onClose }: CsvUploadProps) {
  const [stage, setStage] = useState<Stage>({ id: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const mutation = useUploadCsv();

  const processFile = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      setStage({ id: "validation-error", fileName: file.name, lines: ["File must be a .csv."] });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setStage({
        id: "validation-error",
        fileName: file.name,
        lines: [`File is ${(file.size / 1024 / 1024).toFixed(1)} MB - limit is 5 MB.`],
      });
      return;
    }
    if (file.size === 0) {
      setStage({ id: "validation-error", fileName: file.name, lines: ["File is empty."] });
      return;
    }

    setStage({ id: "validating", fileName: file.name });

    let text: string;
    try {
      text = await file.text();
    } catch {
      setStage({
        id: "validation-error",
        fileName: file.name,
        lines: ["Could not read the file - it may use an unsupported encoding (try saving as UTF-8)."],
      });
      return;
    }

    // Preserve original headers so the mapping step can show the user's columns.
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
    });

    const headers = parsed.meta.fields ?? [];
    if (headers.length === 0 || parsed.data.length === 0) {
      setStage({ id: "validation-error", fileName: file.name, lines: ["No data rows found."] });
      return;
    }

    const mapping = autoMap(headers);
    const allRequiredMapped = FIELDS.filter((f) => f.required).every((f) => mapping[f.key]);

    if (allRequiredMapped) {
      // Clean file - skip the mapping step entirely.
      const { validRows, rejected } = remapAndValidate(parsed.data, mapping);
      setStage({ id: "ready", fileName: file.name, validRows, rejected });
    } else {
      // Don't cold-reject - let the user map their columns.
      setStage({ id: "mapping", fileName: file.name, headers, rawRows: parsed.data, mapping });
    }
  }, []);

  const confirmMapping = useCallback((s: Extract<Stage, { id: "mapping" }>, mapping: Mapping) => {
    const { validRows, rejected } = remapAndValidate(s.rawRows, mapping);
    setStage({ id: "ready", fileName: s.fileName, validRows, rejected });
  }, []);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setStage((s) => (s.id === "idle" ? { id: "dragging" } : s));
  }, []);
  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setStage((s) => (s.id === "dragging" ? { id: "idle" } : s));
  }, []);
  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );
  const onFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile],
  );

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (stage.id !== "ready") return;
    const { validRows, fileName } = stage;
    setStage({ id: "uploading", fileName, progress: 10 });
    const tick = setInterval(() => {
      setStage((s) => (s.id === "uploading" ? { ...s, progress: Math.min(s.progress + 12, 88) } : s));
    }, 350);
    try {
      const result = await mutation.mutateAsync(validRows);
      clearInterval(tick);
      setStage({ id: "success", created: result.created, updated: result.updated, rejected: result.rejected });
    } catch (err) {
      clearInterval(tick);
      setStage({
        id: "error",
        message: isApiError(err) ? err.apiError.message : "Upload failed - please try again.",
      });
    }
  }, [stage, mutation]);

  const downloadErrors = useCallback((rejected: RejectedRow[]) => {
    const dataKeys = Object.keys(rejected[0]?.data ?? {});
    const header = ["row", "external_id", "errors", ...dataKeys].join(",");
    const rows = rejected.map((r) =>
      [r.row, r.external_id ?? "", `"${r.errors.join("; ")}"`, ...dataKeys.map((k) => r.data[k] ?? "")].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "upload-errors.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div aria-live="polite" aria-atomic="false" className="space-y-5">
      {(stage.id === "idle" || stage.id === "dragging") && (
        <DropZone
          isDragging={stage.id === "dragging"}
          inputRef={inputRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onFileChange={onFileChange}
        />
      )}

      {stage.id === "validating" && (
        <div className="flex flex-col items-center gap-4 py-12 text-sm text-muted-foreground">
          <div className="relative size-10">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">Checking your file</p>
            <p className="mt-0.5 text-xs">{stage.fileName}</p>
          </div>
        </div>
      )}

      {stage.id === "validation-error" && (
        <ValidationError fileName={stage.fileName} lines={stage.lines} onRetry={() => setStage({ id: "idle" })} />
      )}

      {stage.id === "mapping" && (
        <MappingPanel
          stage={stage}
          onConfirm={(mapping) => confirmMapping(stage, mapping)}
          onCancel={() => setStage({ id: "idle" })}
        />
      )}

      {stage.id === "ready" && (
        <ReadyPanel
          fileName={stage.fileName}
          validRows={stage.validRows}
          rejected={stage.rejected}
          onDownloadErrors={() => downloadErrors(stage.rejected)}
          onUpload={handleUpload}
          onReset={() => setStage({ id: "idle" })}
        />
      )}

      {stage.id === "uploading" && <UploadingPanel fileName={stage.fileName} progress={stage.progress} />}

      {stage.id === "success" && (
        <SuccessPanel
          created={stage.created}
          updated={stage.updated}
          rejected={stage.rejected}
          onDownloadErrors={() => downloadErrors(stage.rejected)}
          onDone={onClose}
        />
      )}

      {stage.id === "error" && (
        <div role="alert" className="space-y-3">
          <div className="flex items-start gap-3 rounded-xl border border-danger-border bg-danger px-4 py-3.5">
            <AlertCircle className="size-4 mt-0.5 shrink-0 text-danger-foreground" aria-hidden />
            <div className="flex-1 min-w-0 space-y-0.5">
              <p className="text-sm font-medium text-danger-foreground">Upload failed</p>
              <p className="text-sm text-danger-foreground/80">{stage.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStage({ id: "idle" })}
            className="text-sm text-primary underline-offset-2 underline hover:no-underline focus-visible:outline-2 focus-visible:outline focus-visible:outline-ring rounded"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DropZone({
  isDragging,
  inputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}: {
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-3">
      <div
        role="button"
        aria-label="Upload CSV - click or drag a file here"
        tabIndex={0}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-12 text-center cursor-pointer transition-all duration-150 select-none",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
          isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-muted/30",
        )}
      >
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-full transition-colors duration-150",
            isDragging ? "bg-primary/10" : "bg-muted group-hover:bg-primary/5",
          )}
        >
          <UploadCloud
            className={cn(
              "size-7 transition-colors duration-150",
              isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary/70",
            )}
            aria-hidden
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            {isDragging ? "Release to upload" : "Drop your CSV here"}
          </p>
          <p className="text-xs text-muted-foreground">
            or{" "}
            <span className="text-primary font-medium underline-offset-2 group-hover:underline">browse files</span>{" "}
            · max 5 MB
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Bring a Shopify or Klaviyo export - we&apos;ll help you map the columns.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
          onChange={onFileChange}
        />
      </div>

      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={downloadSample}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
        >
          <Download className="size-3.5" aria-hidden />
          Download sample CSV
        </button>
      </div>
    </div>
  );
}

function MappingPanel({
  stage,
  onConfirm,
  onCancel,
}: {
  stage: Extract<Stage, { id: "mapping" }>;
  onConfirm: (mapping: Mapping) => void;
  onCancel: () => void;
}) {
  const [mapping, setMapping] = useState<Mapping>(stage.mapping);
  const missingRequired = FIELDS.filter((f) => f.required && !mapping[f.key]).map((f) => f.label);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-info-border bg-info px-4 py-3">
        <p className="text-sm font-medium text-info-foreground">Match your columns</p>
        <p className="mt-0.5 text-xs text-info-foreground/80">
          We couldn&apos;t auto-detect every required field in <span className="font-medium">{stage.fileName}</span>.
          Pick which of your columns maps to each Lumen field.
        </p>
      </div>

      <div className="space-y-2.5">
        {FIELDS.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            <label
              htmlFor={`map-${field.key}`}
              className="flex w-32 shrink-0 items-center gap-1 text-sm font-medium text-foreground"
            >
              {field.label}
              {field.required && <span className="text-danger-foreground" aria-hidden>*</span>}
            </label>
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <select
              id={`map-${field.key}`}
              value={mapping[field.key] ?? ""}
              onChange={(e) =>
                setMapping((m) => ({ ...m, [field.key]: e.target.value || null }))
              }
              aria-label={`Column for ${field.label}`}
              className="h-8 flex-1 rounded-lg border border-border bg-surface-2 px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">{field.required ? "- select column -" : "- skip -"}</option>
              {stage.headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {missingRequired.length > 0 && (
        <p className="text-xs text-danger-foreground">
          Still needed: {missingRequired.join(", ")}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring rounded"
        >
          Choose a different file
        </button>
        <AsyncButton
          onClick={() => onConfirm(mapping)}
          disabled={missingRequired.length > 0}
          className="h-9 text-sm font-semibold"
        >
          Continue
        </AsyncButton>
      </div>
    </div>
  );
}

function ValidationError({
  fileName,
  lines,
  onRetry,
}: {
  fileName: string;
  lines: string[];
  onRetry: () => void;
}) {
  return (
    <div role="alert" className="space-y-3">
      <div className="rounded-xl border border-danger-border bg-danger overflow-hidden">
        <div className="flex items-start gap-3 px-4 py-3.5">
          <AlertCircle className="size-4 mt-0.5 shrink-0 text-danger-foreground" aria-hidden />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-danger-foreground">Can&apos;t read this file</p>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{fileName}</p>
          </div>
        </div>
        <div className="border-t border-danger-border/60 px-4 py-3 space-y-1">
          {lines.map((line, i) => (
            <p key={i} className="text-xs text-foreground/80">{line}</p>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="text-sm font-medium text-primary underline-offset-2 underline hover:no-underline focus-visible:outline-2 focus-visible:outline focus-visible:outline-ring rounded"
      >
        Try a different file
      </button>
    </div>
  );
}

function ReadyPanel({
  fileName,
  validRows,
  rejected,
  onDownloadErrors,
  onUpload,
  onReset,
}: {
  fileName: string;
  validRows: CsvRow[];
  rejected: RejectedRow[];
  onDownloadErrors: () => void;
  onUpload: () => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 px-4 py-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-4 text-primary" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-none truncate">{fileName}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{validRows.length}</span> valid{" "}
            {validRows.length === 1 ? "row" : "rows"}
            {rejected.length > 0 && (
              <>
                {" "}·{" "}
                <span className="text-danger-foreground font-medium">{rejected.length} will be skipped</span>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          aria-label="Remove selected file"
          onClick={onReset}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline focus-visible:outline-ring rounded"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {rejected.length > 0 && (
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {rejected.length} row{rejected.length !== 1 ? "s" : ""} with errors
            </p>
            <button
              type="button"
              onClick={onDownloadErrors}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors focus-visible:outline-2 focus-visible:outline focus-visible:outline-ring rounded"
            >
              <Download className="size-3" aria-hidden />
              Download CSV
            </button>
          </div>
          <ul className="divide-y divide-border max-h-36 overflow-y-auto">
            {rejected.slice(0, 6).map((r) => (
              <li key={r.row} className="flex items-baseline gap-2 px-4 py-2">
                <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">row {r.row}</span>
                <span className="text-xs text-foreground/80 truncate">{r.errors[0]}</span>
              </li>
            ))}
            {rejected.length > 6 && (
              <li className="px-4 py-2 text-xs text-muted-foreground">
                +{rejected.length - 6} more - download CSV for the full list
              </li>
            )}
          </ul>
        </div>
      )}

      {validRows.length > 0 ? (
        <AsyncButton onClick={onUpload} className="w-full h-9 text-sm font-semibold">
          Import {validRows.length} {validRows.length === 1 ? "customer" : "customers"}
        </AsyncButton>
      ) : (
        <div className="rounded-xl border border-border px-4 py-4 text-center space-y-2">
          <p className="text-sm text-muted-foreground">No valid rows to import.</p>
          <button
            type="button"
            onClick={onReset}
            className="text-sm text-primary underline-offset-2 underline hover:no-underline focus-visible:outline-2 focus-visible:outline focus-visible:outline-ring rounded font-medium"
          >
            Try a different file
          </button>
        </div>
      )}
    </div>
  );
}

function UploadingPanel({ fileName, progress }: { fileName: string; progress: number }) {
  return (
    <div className="space-y-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="size-4 text-primary" aria-hidden />
        </div>
        <p className="text-sm font-medium truncate flex-1 min-w-0">{fileName}</p>
        <span className="text-xs tabular-nums text-muted-foreground shrink-0">{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Upload progress"
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-primary rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-center text-xs text-muted-foreground">Uploading - this may take a moment</p>
    </div>
  );
}

function SuccessPanel({
  created,
  updated,
  rejected,
  onDownloadErrors,
  onDone,
}: {
  created: number;
  updated: number;
  rejected: RejectedRow[];
  onDownloadErrors: () => void;
  onDone: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Migrated onto the semantic success token */}
      <div className="flex items-center gap-3 rounded-xl border border-success-border bg-success px-4 py-3.5">
        <CheckCircle2 className="size-5 shrink-0 text-success-foreground" aria-hidden />
        <div className="space-y-0.5">
          {created > 0 && (
            <p className="text-sm text-foreground">
              <span className="font-semibold">{created}</span> {created === 1 ? "customer" : "customers"} added
            </p>
          )}
          {updated > 0 && (
            <p className="text-sm text-foreground">
              <span className="font-semibold">{updated}</span> {updated === 1 ? "customer" : "customers"} updated
            </p>
          )}
          {created === 0 && updated === 0 && <p className="text-sm text-foreground">Import complete</p>}
        </div>
      </div>

      {rejected.length > 0 && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-1 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">{rejected.length}</span>{" "}
            {rejected.length === 1 ? "row was" : "rows were"} rejected. Duplicate external IDs count as updates, not errors.
          </p>
          <button
            type="button"
            onClick={onDownloadErrors}
            className="flex shrink-0 items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors focus-visible:outline-2 focus-visible:outline focus-visible:outline-ring rounded"
          >
            <Download className="size-3" aria-hidden />
            Download
          </button>
        </div>
      )}

      <AsyncButton variant="outline" onClick={onDone} className="w-full">
        Done
      </AsyncButton>
    </div>
  );
}
