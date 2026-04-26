"use client";

import { useState, useTransition } from "react";
import { updateContractor, resendContractorInvite } from "@/lib/actions/contractors";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Pencil, Mail } from "lucide-react";
import { toast } from "sonner";

interface Contractor {
  id: string;
  company_name?: string | null;
  contact_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  discount_pct?: number;
  notes?: string | null;
}

export function ContractorRowActions({ contractor }: { contractor: Contractor }) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const r = await updateContractor(contractor.id, fd);
      if (r.success) {
        toast.success("Contractor updated");
        setEditOpen(false);
      } else {
        toast.error("Failed to update", { description: r.error });
      }
    });
  }

  function handleResend() {
    startTransition(async () => {
      const r = await resendContractorInvite(contractor.id);
      if (r.success) {
        toast.success("Invite email resent");
      } else {
        toast.error("Failed to resend invite", { description: r.error });
      }
    });
  }

  return (
    <>
      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleResend}
              disabled={isPending || !contractor.email}
            >
              <Mail className="h-4 w-4 mr-2" />
              Resend Invite
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Contractor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="company_name">Company Name *</Label>
                <Input
                  id="company_name"
                  name="company_name"
                  defaultValue={contractor.company_name ?? ""}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contact_name">Contact Person</Label>
                  <Input
                    id="contact_name"
                    name="contact_name"
                    defaultValue={contractor.contact_name ?? ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={contractor.phone ?? ""}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={contractor.email ?? ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  defaultValue={contractor.address ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="discount_pct">Discount %</Label>
                <div className="relative">
                  <Input
                    id="discount_pct"
                    name="discount_pct"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    defaultValue={contractor.discount_pct ?? 0}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={contractor.notes ?? ""}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
