"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  children: React.ReactNode;
}

const Sheet = ({ open, onOpenChange, side = "left", children }: SheetProps) => {
  if (!open) return null;

  const positionClasses = {
    left: "inset-y-0 left-0",
    right: "inset-y-0 right-0",
    top: "inset-x-0 top-0",
    bottom: "inset-x-0 bottom-0",
  };

  const slideClasses = {
    left: "translate-x-0 data-[state=closed]:-translate-x-full",
    right: "translate-x-0 data-[state=closed]:translate-x-full",
    top: "translate-y-0 data-[state=closed]:-translate-y-full",
    bottom: "translate-y-0 data-[state=closed]:translate-y-full",
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60" onClick={() => onOpenChange(false)} />
      <div
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          positionClasses[side],
          slideClasses[side],
          side === "left" && "w-3/4 sm:max-w-sm",
          side === "right" && "w-3/4 sm:max-w-sm",
          side === "top" && "h-3/4 sm:max-h-sm",
          side === "bottom" && "h-3/4 sm:max-h-sm"
        )}
      >
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => onOpenChange(false)}
        >
          X
        </button>
        {children}
      </div>
    </>
  );
};

export { Sheet };
