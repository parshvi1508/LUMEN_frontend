"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import { Search, Plus, ChevronRight, Upload, Wand2, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTION_LABEL: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  segments: "Segments",
  campaigns: "Campaigns",
};

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const section = pathname.split("/")[1] ?? "dashboard";
  const label = SECTION_LABEL[section] ?? "Dashboard";

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/customers?q=${encodeURIComponent(query.trim())}` : "/customers");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-surface-1/80 px-4 backdrop-blur md:px-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
        <span className="text-muted-foreground">Lumen</span>
        <ChevronRight className="size-3.5 text-muted-foreground/60" aria-hidden />
        <span aria-current="page" className="font-medium text-foreground">
          {label}
        </span>
      </nav>

      {/* Global search - routes to the customer book */}
      <form onSubmit={submitSearch} className="ml-auto w-full max-w-xs sm:ml-6" role="search">
        <label htmlFor="global-search" className="sr-only">
          Search customers
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="global-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers…"
            className="h-9 w-full rounded-lg border border-border bg-surface-2 pl-8 pr-3 text-sm shadow-card outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          />
        </div>
      </form>

      {/* Primary Create action */}
      <Menu.Root>
        <Menu.Trigger
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-card transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Create</span>
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
            <Menu.Popup className="min-w-52 overflow-hidden rounded-xl border border-border bg-surface-3 p-1 shadow-overlay outline-none transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
              <CreateItem
                icon={<Upload className="size-4" />}
                title="Import customers"
                desc="Upload a CSV"
                onClick={() => router.push("/customers")}
              />
              <CreateItem
                icon={<Wand2 className="size-4" />}
                title="New segment"
                desc="Coming soon"
                onClick={() => router.push("/segments")}
              />
              <CreateItem
                icon={<Megaphone className="size-4" />}
                title="New campaign"
                desc="Coming soon"
                onClick={() => router.push("/campaigns")}
              />
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </header>
  );
}

function CreateItem({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <Menu.Item
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none",
        "data-[highlighted]:bg-muted focus-visible:bg-muted",
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="flex flex-col">
        <span className="font-medium text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </span>
    </Menu.Item>
  );
}
