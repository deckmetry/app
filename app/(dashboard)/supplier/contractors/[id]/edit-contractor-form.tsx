"use client";

import { useTransition } from "react";
import { updateContractor } from "@/lib/actions/contractors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

interface EditContractorFormProps {
  contractor: {
    id: string;
    company_name?: string | null;
    contact_name?: string | null;
    phone?: string | null;
    address?: string | null;
    discount_pct?: number;
    notes?: string | null;
  };
}

export function EditContractorForm({ contractor }: EditContractorFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // email field is required by schema but we pass a placeholder since it's already set
    formData.set("email", "placeholder@deckmetry.com");
    startTransition(async () => {
      const result = await updateContractor(contractor.id, formData);
      if (result.success) {
        toast.success("Contractor updated");
      } else {
        toast.error("Failed to update", { description: result.error });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contractor Details</CardTitle>
        <CardDescription>Update contact info and discount rate.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                name="company_name"
                defaultValue={contractor.company_name ?? ""}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_name">Contact Person</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={contractor.contact_name ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={contractor.phone ?? ""}
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={contractor.notes ?? ""}
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
