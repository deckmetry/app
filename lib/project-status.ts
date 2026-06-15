// Contractor-facing material-list status, derived from estimate.status + project.status.
import type { ProjectScope } from "@/lib/types";

export type StatusVariant = "default" | "secondary" | "outline";

export function projectStatusLabel(
  estimateStatus: string | null | undefined,
  projectStatus: string | null | undefined
): { label: string; variant: StatusVariant } {
  if (estimateStatus === "draft") return { label: "Draft", variant: "outline" };

  switch (projectStatus) {
    case "estimate_requested":
      return { label: "Review Requested", variant: "secondary" };
    case "estimate_received":
      return { label: "Quote Received", variant: "default" };
    case "po_submitted":
    case "po_confirmed":
      return { label: "Ordered", variant: "default" };
    case "materials_shipped":
    case "materials_delivered":
      return { label: "Delivered", variant: "default" };
    case "complete":
      return { label: "Complete", variant: "default" };
    case "cancelled":
      return { label: "Cancelled", variant: "outline" };
    case "bom_created":
    default:
      return { label: "List Finished", variant: "default" };
  }
}

export function scopeLabel(scope: ProjectScope | string | null | undefined): string {
  if (scope === "roof") return "Roof";
  if (scope === "deck_roof") return "Deck + Roof";
  return "Deck";
}
