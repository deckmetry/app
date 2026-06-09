"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2 } from "lucide-react";

const COPIES = [
  "Deck size", "Materials", "Railing selection", "Fascia", "Stairs",
  "Skirting", "Lighting", "Material list structure",
];
const EDITABLE = [
  "Homeowner name", "Address", "Delivery date", "Dimensions", "Product colors",
];

export function CloneDialog({
  projectName,
  triggerLabel = "Clone",
  triggerVariant = "outline",
  triggerSize = "sm",
  onCloned,
}: {
  projectName: string;
  triggerLabel?: string;
  triggerVariant?: "outline" | "ghost" | "default";
  triggerSize?: "sm" | "default";
  onCloned?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const clone = () => {
    setOpen(false);
    onCloned?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clone {projectName}?</DialogTitle>
          <DialogDescription>
            This will copy the configuration into a new draft project you can edit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">This will copy</p>
            <ul className="space-y-1.5">
              {COPIES.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> {c}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">You can update</p>
            <ul className="space-y-1.5">
              {EDITABLE.map((c) => (
                <li key={c} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={clone} className="gap-1.5"><Copy className="h-4 w-4" /> Clone as New Draft</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
