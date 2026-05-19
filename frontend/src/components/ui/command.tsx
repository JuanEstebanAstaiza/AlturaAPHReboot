"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CommandProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string; icon?: React.ReactNode }[];
  placeholder?: string;
}

const Command = ({ value, onValueChange, items, placeholder }: CommandProps) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className="relative w-full">
      <div
        className="flex h-10 w-full items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm cursor-text"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {value ? (
          <span>{items.find((i) => i.value === value)?.label}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder || "Search..."}</span>
        )}
        <input
          ref={inputRef}
          className="flex-1 outline-none bg-transparent"
          value={open ? search : ""}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setSearch("");
            }
          }}
        />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover shadow-md">
          {filtered.map((item) => (
            <div
              key={item.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                value === item.value && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                onValueChange(item.value);
                setOpen(false);
                setSearch("");
              }}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results</div>
          )}
        </div>
      )}
    </div>
  );
};

export { Command };
