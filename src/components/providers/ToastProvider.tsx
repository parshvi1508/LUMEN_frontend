"use client";

import { Toaster } from "@/components/ui/sonner";

// Re-export `toast` from sonner for use anywhere in the app.
export { toast } from "sonner";

export function ToastProvider() {
  return <Toaster richColors closeButton position="top-right" />;
}
