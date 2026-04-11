"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const STAGES = [
  { key: "bom_created", label: "BOM" },
  { key: "estimate_received", label: "Estimate" },
  { key: "proposal_sent", label: "Proposal" },
  { key: "agreement_signed", label: "Agreement" },
  { key: "po_submitted", label: "PO Sent" },
  { key: "po_confirmed", label: "Confirmed" },
  { key: "materials_shipped", label: "Shipped" },
  { key: "materials_delivered", label: "Delivered" },
  { key: "complete", label: "Complete" },
] as const;

// Map all statuses to their stage index
const STATUS_TO_STAGE: Record<string, number> = {
  bom_created: 0,
  estimate_requested: 0,
  estimate_received: 1,
  proposal_sent: 2,
  proposal_viewed: 2,
  agreement_signed: 3,
  po_submitted: 4,
  po_confirmed: 5,
  materials_shipped: 6,
  materials_delivered: 7,
  complete: 8,
  cancelled: -1,
};

interface ProjectPipelineProps {
  status: string;
  className?: string;
}

export function ProjectPipeline({ status, className }: ProjectPipelineProps) {
  const currentStageIdx = STATUS_TO_STAGE[status] ?? 0;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div className={cn("rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive", className)}>
        Project Cancelled
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex items-center gap-0 min-w-max">
        {STAGES.map((stage, idx) => {
          const isComplete = idx < currentStageIdx;
          const isCurrent = idx === currentStageIdx;

          return (
            <div key={stage.key} className="flex items-center">
              {idx > 0 && (
                <div
                  className={cn(
                    "h-0.5 w-6 sm:w-10",
                    isComplete ? "bg-primary" : "bg-border"
                  )}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isCurrent
                        ? "bg-primary/20 text-primary ring-2 ring-primary"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium whitespace-nowrap",
                    isCurrent
                      ? "text-primary"
                      : isComplete
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
