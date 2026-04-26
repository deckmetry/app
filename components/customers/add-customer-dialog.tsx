"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  searchCustomerByEmail,
  addExistingCustomer,
  createAndAddCustomer,
} from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Loader2,
  Building2,
  CheckCircle2,
  UserPlus,
  AlertCircle,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────

type Step = "search" | "create";

interface SearchResult {
  found: boolean;
  alreadyCustomer: boolean;
  organization?: {
    id: string;
    name: string;
    email: string | null;
    type: string;
  };
}

interface Result {
  success: boolean;
  error?: string;
}

interface AddCustomerDialogProps {
  role: "contractor" | "supplier";
}

// ─── Labels by role ─────────────────────────────────────────

const LABELS: Record<string, { title: string; description: string }> = {
  contractor: {
    title: "Add Customer",
    description:
      "Search for an existing homeowner on Deckmetry, or create a new customer.",
  },
  supplier: {
    title: "Add Customer",
    description:
      "Search for an existing customer on Deckmetry, or create a new one.",
  },
};

// ─── Component ──────────────────────────────────────────────

export function AddCustomerDialog({ role }: AddCustomerDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Step state
  const [step, setStep] = useState<Step>("search");

  // Search state
  const [email, setEmail] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Create form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Action error state
  const [actionError, setActionError] = useState<string | null>(null);

  const labels = LABELS[role] ?? LABELS.contractor;

  function resetForm() {
    setStep("search");
    setEmail("");
    setSearchResult(null);
    setIsSearching(false);
    setSearchError(null);
    setName("");
    setPhone("");
    setAddress("");
    setNotes("");
    setActionError(null);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    setActionError(null);

    try {
      const result = await searchCustomerByEmail(trimmed);
      setSearchResult(result as SearchResult);
    } catch {
      setSearchError("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function handleAddExisting() {
    if (!searchResult?.organization) return;

    startTransition(async () => {
      setActionError(null);
      try {
        const result: Result = await addExistingCustomer(
          searchResult.organization!.id,
          notes.trim() || undefined
        );
        if (result.success) {
          setOpen(false);
          resetForm();
          router.refresh();
        } else {
          setActionError(result.error ?? "Failed to add customer.");
        }
      } catch {
        setActionError("An unexpected error occurred.");
      }
    });
  }

  function handleTransitionToCreate() {
    setStep("create");
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      setActionError(null);
      try {
        const result: Result = await createAndAddCustomer({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        if (result.success) {
          setOpen(false);
          resetForm();
          router.refresh();
        } else {
          setActionError(result.error ?? "Failed to create customer.");
        }
      } catch {
        setActionError("An unexpected error occurred.");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        {/* ─── Step 1: Email Search ──────────────────────────── */}
        {step === "search" && (
          <div className="mt-4 space-y-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <Label htmlFor="customer-email-search">Email Address</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="customer-email-search"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSearchResult(null);
                      setSearchError(null);
                    }}
                    placeholder="homeowner@example.com"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="w-full gap-2"
                disabled={isSearching || !email.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </form>

            {/* Search error */}
            {searchError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{searchError}</p>
              </div>
            )}

            {/* Search results */}
            {searchResult && (
              <div className="space-y-3">
                {/* Case A: Found on platform & not yet a customer */}
                {searchResult.found && !searchResult.alreadyCustomer && searchResult.organization && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {searchResult.organization.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Found on Deckmetry
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="add-notes" className="text-xs">
                        Notes (optional)
                      </Label>
                      <Input
                        id="add-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Internal notes about this customer..."
                        className="mt-1"
                      />
                    </div>
                    <Button
                      className="w-full gap-2"
                      size="sm"
                      onClick={handleAddExisting}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Add as Customer
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Case B: Found but already a customer */}
                {searchResult.found && searchResult.alreadyCustomer && (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        Already in your customer list
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchResult.organization?.name} is already one of
                        your customers.
                      </p>
                    </div>
                  </div>
                )}

                {/* Case C: Not found */}
                {!searchResult.found && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Not on Deckmetry yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Create a new customer record and send them an
                          invitation.
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full gap-2"
                      size="sm"
                      onClick={handleTransitionToCreate}
                    >
                      <Plus className="h-4 w-4" />
                      Create New Customer
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Action error */}
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{actionError}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ─── Step 2: Create New Customer ───────────────────── */}
        {step === "create" && (
          <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
            <div>
              <Label htmlFor="new-customer-name">Name *</Label>
              <Input
                id="new-customer-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <Label htmlFor="new-customer-email">Email</Label>
              <Input
                id="new-customer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <Label htmlFor="new-customer-phone">Phone</Label>
              <Input
                id="new-customer-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label htmlFor="new-customer-address">Address</Label>
              <Input
                id="new-customer-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div>
              <Label htmlFor="new-customer-notes">Notes</Label>
              <Textarea
                id="new-customer-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes about this customer..."
                rows={2}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              We&apos;ll send them an invitation to join Deckmetry.
            </p>

            {/* Action error */}
            {actionError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{actionError}</p>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep("search");
                  setActionError(null);
                }}
                disabled={isPending}
              >
                Back
              </Button>
              <Button type="submit" disabled={isPending || !name.trim()}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Customer"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
