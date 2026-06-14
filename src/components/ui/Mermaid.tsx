"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Renders a Mermaid diagram from a static chart string. Theme-aware (re-renders
 * on light/dark switch). The chart text comes only from our own constants in
 * lib/diagrams, never user input, and mermaid runs with securityLevel "strict",
 * so the dangerouslySetInnerHTML below is safe.
 */
export function Mermaid({ chart, label }: { chart: string; label?: string }) {
  const { resolvedTheme } = useTheme();
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: resolvedTheme === "dark" ? "dark" : "default",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
        });
        const { svg } = await mermaid.render(`mmd-${rawId}`, chart);
        if (active) {
          setSvg(svg);
          setFailed(false);
        }
      } catch {
        if (active) setFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [chart, resolvedTheme, rawId]);

  if (failed) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-surface-1 p-4 text-xs text-muted-foreground">
        {chart}
      </pre>
    );
  }

  return (
    <div
      role="img"
      aria-label={label}
      className="mermaid-diagram w-full overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
