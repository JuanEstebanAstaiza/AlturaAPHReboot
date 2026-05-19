import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FeatureBlockedResponse } from "@/types/user";

interface FeatureBlockedBannerProps {
  data: FeatureBlockedResponse;
  onDismiss?: () => void;
}

export function FeatureBlockedBanner({ data, onDismiss }: FeatureBlockedBannerProps) {
  const planLabel = data.tenant_plan.charAt(0).toUpperCase() + data.tenant_plan.slice(1);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="rounded-lg border border-warning/30 bg-card shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-warning/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Módulo no disponible</p>
            <p className="text-xs text-muted-foreground mt-1">
              El módulo <span className="font-medium text-foreground">{data.feature}</span> no está incluido en tu plan actual.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Tu plan <Badge variant="outline" className="text-xs ml-1">{planLabel}</Badge> incluye:{" "}
              {data.available_features.map((f) => f).join(", ")}
            </p>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onDismiss}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
