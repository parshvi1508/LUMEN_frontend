import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Small uppercase eyebrow above the title (e.g. section / provenance). */
  eyebrow?: ReactNode;
  /** Right-aligned actions (buttons, menus). */
  actions?: ReactNode;
  /** Optional content rendered below the title block (filters, tabs, stats). */
  children?: ReactNode;
  className?: string;
}

/**
 * Shared page header primitive — every route renders its title block through
 * this so spacing, typography, and the action slot stay consistent. Chrome
 * (surface-1) so it reads as a frame around the data surfaces below it.
 */
export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "border-b border-border bg-surface-1 px-6 md:px-8 py-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </header>
  );
}
