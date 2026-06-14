"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Avoid a hydration mismatch: render a placeholder until mounted.
  if (!mounted) return <div className="size-9 shrink-0" aria-hidden />;

  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="group flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-foreground shadow-card transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      {dark ? (
        <Sun
          className="size-4 transition-transform duration-300 ease-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
          aria-hidden
        />
      ) : (
        <Moon
          className="size-4 transition-transform duration-300 ease-out group-hover:-rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
          aria-hidden
        />
      )}
    </button>
  );
}
