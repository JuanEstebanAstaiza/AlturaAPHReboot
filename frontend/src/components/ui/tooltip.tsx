"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

const Tooltip = ({ content, children, delay = 0 }: TooltipProps) => {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <div className="absolute z-50 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md shadow-md whitespace-nowrap -translate-x-1/2 top-full mt-1 left-1/2">
          {content}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rotate-45" />
        </div>
      )}
    </div>
  );
};

export { Tooltip };
