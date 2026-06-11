"use client";

import { Menu } from "@base-ui/react/menu";
import { MoreHorizontal, User, Wand2, Download, Mail } from "lucide-react";
import type { Customer } from "@/lib/schemas/customer";
import { cn } from "@/lib/utils";

interface RowActionsProps {
  customer: Customer;
  onView: (c: Customer) => void;
  onRowAction: (c: Customer, action: "segment" | "export" | "email") => void;
}

export function RowActions({ customer, onView, onRowAction }: RowActionsProps) {
  return (
    <Menu.Root>
      <Menu.Trigger
        onClick={(e) => e.stopPropagation()}
        aria-label={`Actions for ${customer.name}`}
        className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring aria-expanded:bg-muted"
      >
        <MoreHorizontal className="size-4" aria-hidden />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6} className="z-50">
          <Menu.Popup className="min-w-44 overflow-hidden rounded-xl border border-border bg-surface-3 p-1 shadow-overlay outline-none transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0">
            <Item icon={<User className="size-4" />} onClick={() => onView(customer)}>
              View profile
            </Item>
            <Item
              icon={<Wand2 className="size-4" />}
              onClick={() => onRowAction(customer, "segment")}
            >
              Add to segment
            </Item>
            <Item
              icon={<Download className="size-4" />}
              onClick={() => onRowAction(customer, "export")}
            >
              Export
            </Item>
            <Item
              icon={<Mail className="size-4" />}
              onClick={() => onRowAction(customer, "email")}
            >
              Email
            </Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function Item({
  icon,
  onClick,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Menu.Item
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-foreground outline-none",
        "data-[highlighted]:bg-muted",
      )}
    >
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </Menu.Item>
  );
}
