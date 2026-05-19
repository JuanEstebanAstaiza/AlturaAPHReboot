"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

const RadioGroup = ({ value, onValueChange, children, className }: RadioGroupProps) => (
  <div className={cn("grid gap-2", className)} role="radiogroup">
    {React.Children.map(children, (child) =>
      React.isValidElement(child)
        ? React.cloneElement(child, { activeValue: value, onValueChange } as any)
        : child
    )}
  </div>
);

export interface RadioGroupItemProps {
  value: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const RadioGroupItem = ({ value, activeValue, onValueChange, className }: RadioGroupItemProps) => (
  <button
    type="button"
    role="radio"
    aria-checked={value === activeValue}
    className={cn(
      "h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      value === activeValue && "bg-primary text-primary-foreground",
      className
    )}
    onClick={() => onValueChange?.(value)}
  >
    {value === activeValue && <span className="flex h-full w-full items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
    </span>}
  </button>
);

export { RadioGroup, RadioGroupItem };
