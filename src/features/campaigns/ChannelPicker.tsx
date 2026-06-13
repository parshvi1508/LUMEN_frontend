"use client";

import { MessageCircle, Smartphone, Mail, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Channel } from "@/lib/schemas/types";

const CHANNELS: { id: Channel; label: string; Icon: typeof Mail }[] = [
  { id: "whatsapp", label: "WhatsApp", Icon: MessageCircle },
  { id: "sms", label: "SMS", Icon: Smartphone },
  { id: "email", label: "Email", Icon: Mail },
];

export function ChannelPicker({
  value,
  onChange,
  recommended,
}: {
  value: Channel;
  onChange: (c: Channel) => void;
  recommended?: Channel;
}) {
  return (
    <div role="group" aria-label="Channel" className="flex flex-wrap gap-2">
      {CHANNELS.map(({ id, label, Icon }) => {
        const active = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
              active
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {recommended === id && (
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-ai-foreground">
                <Star className="size-3 fill-current" aria-hidden />
                AI pick
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
