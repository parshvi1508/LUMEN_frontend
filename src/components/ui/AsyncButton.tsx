"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// @base-ui/react Button passes through standard HTML button attributes.
// We build on top of our shadcn Button wrapper.

interface AsyncButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  // Optional: show a brief success state after the mutation settles
  success?: boolean;
  successText?: string;
  children: ReactNode;
}

export function AsyncButton({
  loading = false,
  loadingText,
  success = false,
  successText,
  disabled,
  children,
  className,
  variant,
  size,
  ...props
}: AsyncButtonProps) {
  const isDisabled = disabled || loading;

  let label: ReactNode = children;
  if (loading && loadingText) label = loadingText;
  else if (success && successText) label = successText;

  return (
    <Button
      // Prevent double-submit: disabled the instant it's clicked while pending
      disabled={isDisabled}
      aria-busy={loading || undefined}
      // aria-disabled communicates the reason to screen readers even when
      // disabled attribute is set (spec §3.2 a11y note)
      aria-disabled={isDisabled || undefined}
      variant={variant}
      size={size}
      className={cn(className)}
      {...props}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="size-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {label}
    </Button>
  );
}
