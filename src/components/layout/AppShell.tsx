"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "@base-ui/react/drawer";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { MotionConfig } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  PieChart,
  Megaphone,
  Menu,
  X,
  Zap,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import { useAuth } from "@/components/providers";
import { TopBar } from "@/components/layout/TopBar";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/customers",  label: "Customers",  icon: Users },
  { href: "/segments",   label: "Segments",   icon: PieChart },
  { href: "/campaigns",  label: "Campaigns",  icon: Megaphone },
] as const;

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-full min-h-screen">
      {/* Skip-to-content - first focusable element on the page */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline focus:outline-2 focus:outline-ring"
      >
        Skip to content
      </a>

      {/* Desktop sidebar */}
      <aside
        aria-label="Main navigation"
        className="hidden md:flex md:w-56 md:shrink-0 md:flex-col border-r border-border bg-sidebar"
      >
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger + drawer */}
      <div className="md:hidden">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-30 flex size-9 items-center justify-center rounded-lg border border-border bg-background shadow-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Menu className="size-4" aria-hidden />
        </button>

        <Drawer.Root open={mobileOpen} onOpenChange={setMobileOpen}>
          <Drawer.Portal>
            <Drawer.Backdrop className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
            <Drawer.Popup className="fixed left-0 top-0 bottom-0 z-50 flex w-56 flex-col border-r border-border bg-sidebar shadow-xl transition-transform duration-200 ease-out data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full focus:outline-none">
              <Drawer.Title className="sr-only">Navigation menu</Drawer.Title>
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <BrandMark />
                <Drawer.Close
                  aria-label="Close navigation"
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <X className="size-4" aria-hidden />
                </Drawer.Close>
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter />
            </Drawer.Popup>
          </Drawer.Portal>
        </Drawer.Root>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 bg-surface-1">
        <TopBar />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 focus:outline-none"
        >
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-5 pb-3">
        <BrandMark />
      </div>
      <NavList />
      <StatusStrip />
      <SidebarFooter />
    </div>
  );
}

function StatusStrip() {
  return (
    <div className="mx-3 mb-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2 space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">Channel</span>
        <span className="flex items-center gap-1 font-medium text-foreground">
          <span className="size-1.5 rounded-full bg-success-foreground" aria-hidden />
          Simulated
        </span>
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">AI</span>
        <span className="flex items-center gap-1 font-medium text-foreground">
          <span className="size-1.5 rounded-full bg-success-foreground" aria-hidden />
          Groq
        </span>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
      aria-label="Lumen CRM - go to dashboard"
    >
      <div className="flex size-7 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-ai-accent shadow-sm ring-1 ring-primary/20">
        <Zap className="size-4 text-white drop-shadow-sm" aria-hidden />
      </div>
      <span className="text-sm font-semibold text-foreground tracking-tight">
        {BRAND.name}
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="flex-1 px-2 py-3">
      <ul role="list" className="space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-sidebar-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon
                  className={cn("size-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")}
                  aria-hidden
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter() {
  const { user, signOut } = useAuth();
  const email = user?.email ?? "";
  const initials = email ? email.slice(0, 2).toUpperCase() : "??";
  const name = email ? email.split("@")[0] : "Account";

  return (
    <div className="border-t border-sidebar-border p-3">
      <MenuPrimitive.Root>
        <MenuPrimitive.Trigger className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
          <span
            aria-hidden
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-ai-accent/25 text-xs font-semibold text-primary ring-1 ring-primary/15 select-none"
          >
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {email || "Signed in"}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </MenuPrimitive.Trigger>
        <MenuPrimitive.Portal>
          <MenuPrimitive.Positioner side="top" align="start" sideOffset={8} className="z-50">
            <MenuPrimitive.Popup className="w-56 rounded-xl border border-border bg-surface-3 p-1 shadow-overlay outline-none">
              <div className="px-2.5 py-1.5">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="truncate text-sm font-medium text-foreground">
                  {email || "Account"}
                </p>
              </div>
              <div className="my-1 h-px bg-border" />
              <MenuPrimitive.Item
                onClick={signOut}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-destructive outline-none data-[highlighted]:bg-destructive/10"
              >
                <LogOut className="size-4" aria-hidden />
                Log out
              </MenuPrimitive.Item>
            </MenuPrimitive.Popup>
          </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      </MenuPrimitive.Root>
    </div>
  );
}
