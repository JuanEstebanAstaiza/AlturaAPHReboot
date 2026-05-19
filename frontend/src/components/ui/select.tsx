"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}

const Select = ({ value, onValueChange, children, placeholder }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && (child.props as any).value === value
  ) as React.ReactElement<{ label?: string }>;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          !value && placeholder && "text-muted-foreground"
        )}
      >
        {value ? selectedLabel?.props?.label || value : placeholder || "Select..."}
        <svg className="ml-2 h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {children}
        </div>
      )}
    </div>
  );
};

export interface SelectItemProps {
  value: string;
  label?: string;
  children?: React.ReactNode;
}

const SelectItem = ({ value, label, children, ...props }: SelectItemProps) => {
  const props2 = props as any;
  const parent = (props2 as any).parentContext;
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        parent?.activeValue === value && "font-semibold"
      )}
      onClick={() => parent?.onValueChange?.(value)}
    >
      {label || children}
    </div>
  );
};

export { Select, SelectItem };
