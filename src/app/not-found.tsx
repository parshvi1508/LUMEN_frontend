import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
          <Zap className="size-4 text-primary-foreground" aria-hidden />
        </span>
        <span className="text-base font-semibold tracking-tight text-foreground">
          Lumen
        </span>
      </div>

      <div className="space-y-2">
        <p className="text-5xl font-semibold tracking-tight text-foreground">404</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          That page does not exist. It may have moved, or the link was mistyped.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to dashboard
      </Link>
    </main>
  );
}
