import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { src?: string; name?: string }
>(({ className, src, name, ...props }, ref) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {src ? (
        <img src={src} alt={name ?? ""} className="aspect-square h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
          {initials}
        </div>
      )}
    </div>
  );
});
Avatar.displayName = "Avatar";

export { Avatar };
