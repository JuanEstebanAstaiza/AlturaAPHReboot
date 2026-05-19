import { Building2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TenantBadgeProps {
  name: string;
  unit?: string;
  plan: string;
  className?: string;
}

export function TenantBadge({ name, unit, plan, className }: TenantBadgeProps) {
  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{name}</p>
        {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
      </div>
      <Badge variant="outline" className="text-xs">
        {planLabel}
      </Badge>
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </div>
  );
}
