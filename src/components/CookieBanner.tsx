"use client";
import { useState, useEffect } from "react";
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem("cookie-consent")) setVisible(true); } catch {} }, []);
  function accept() { try { localStorage.setItem("cookie-consent", "accepted"); } catch {} setVisible(false); }
  function reject() { try { localStorage.setItem("cookie-consent", "rejected"); } catch {} setVisible(false); }
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-surface-2 px-6 py-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">We use essential cookies for authentication only. <a href="/privacy" className="underline hover:text-foreground">Privacy policy</a></p>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={reject} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Reject</button>
          <button type="button" onClick={accept} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Accept</button>
        </div>
      </div>
    </div>
  );
}