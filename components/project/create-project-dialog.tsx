"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProject, searchOrganizations } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, X, Building2, Mail, UserPlus } from "lucide-react";

type Role = "homeowner" | "contractor" | "supplier";
type LinkMode = "search" | "create" | "invite";

interface SearchResult {
  id: string;
  name: string;
  type: string;
  email: string | null;
}

interface CreateProjectDialogProps {
  role: Role;
}

const LINK_LABELS: Record<Role, string> = {
  homeowner: "",
  contractor: "Link Homeowner",
  supplier: "Link Customer",
};

const SEARCH_TYPE_FILTER: Record<Role, "homeowner" | "contractor" | undefined> = {
  homeowner: undefined,
  contractor: "homeowner",
  supplier: undefined, // suppliers search both homeowner and contractor
};

export function CreateProjectDialog({ role }: CreateProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");

  // Org linking state
  const [linkMode, setLinkMode] = useState<LinkMode>("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<SearchResult | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // New customer form state
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerEmail, setNewCustomerEmail] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");

  const showOrgLinking = role !== "homeowner";

  // Debounced search
  useEffect(() => {
    if (!showOrgLinking || linkMode !== "search" || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchOrganizations(searchQuery, SEARCH_TYPE_FILTER[role]);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery, showOrgLinking, role, linkMode]);

  function resetForm() {
    setName("");
    setAddress("");
    setDescription("");
    setLinkMode("search");
    setSearchQuery("");
    setSearchResults([]);
    setSelectedOrg(null);
    setInviteEmail("");
    setNewCustomerName("");
    setNewCustomerEmail("");
    setNewCustomerPhone("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    startTransition(async () => {
      const result = await createProject({
        name: name.trim(),
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        linkedOrgId: selectedOrg?.id,
        linkedOrgRole: selectedOrg
          ? (selectedOrg.type as "homeowner" | "contractor" | "supplier")
          : undefined,
        inviteEmail: linkMode === "invite" && !selectedOrg && inviteEmail.trim()
          ? inviteEmail.trim()
          : undefined,
        newCustomer: linkMode === "create" && newCustomerName.trim()
          ? {
              name: newCustomerName.trim(),
              email: newCustomerEmail.trim() || undefined,
              phone: newCustomerPhone.trim() || undefined,
            }
          : undefined,
      });

      if (result.success && result.projectId) {
        setOpen(false);
        resetForm();
        // Redirect to wizard with project data pre-populated, starting at geometry step
        const params = new URLSearchParams({
          projectId: result.projectId,
          startStep: "geometry",
          role,
        });
        if (name.trim()) params.set("projectName", name.trim());
        if (address.trim()) params.set("projectAddress", address.trim());
        router.push(`/estimate?${params.toString()}`);
      }
    });
  }

  const linkModeOptions: { value: LinkMode; label: string; icon: React.ReactNode }[] = [
    { value: "search", label: "Search", icon: <Search className="h-3 w-3" /> },
    { value: "create", label: "New", icon: <UserPlus className="h-3 w-3" /> },
    { value: "invite", label: "Invite", icon: <Mail className="h-3 w-3" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Create a new deck project to track documents and progress.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Project fields */}
            <div>
              <Label htmlFor="project-name">Project Name *</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Smith Residence Deck"
                required
              />
            </div>
            <div>
              <Label htmlFor="project-address">Address</Label>
              <Input
                id="project-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, City, State"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief project notes..."
                rows={2}
              />
            </div>

            {/* Org linking (contractor + supplier only) */}
            {showOrgLinking && (
              <>
                <Separator />
                <div>
                  <Label>{LINK_LABELS[role]}</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Search for an existing account, create a new customer, or invite by email.
                  </p>

                  {selectedOrg ? (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{selectedOrg.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedOrg.email} — <span className="capitalize">{selectedOrg.type}</span>
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => { setSelectedOrg(null); setSearchQuery(""); }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Mode selector */}
                      <div className="flex gap-1 rounded-lg border p-1">
                        {linkModeOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            className={`flex-1 flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                              linkMode === opt.value
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                            onClick={() => setLinkMode(opt.value)}
                          >
                            {opt.icon}
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {/* Search mode */}
                      {linkMode === "search" && (
                        <>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Search by name or email..."
                              className="pl-9"
                            />
                          </div>

                          {(searchResults.length > 0 || isSearching) && (
                            <div className="rounded-lg border max-h-40 overflow-y-auto">
                              {isSearching ? (
                                <p className="p-3 text-xs text-muted-foreground text-center">Searching...</p>
                              ) : (
                                searchResults.map((org) => (
                                  <button
                                    key={org.id}
                                    type="button"
                                    className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                    onClick={() => {
                                      setSelectedOrg(org);
                                      setSearchQuery("");
                                      setSearchResults([]);
                                    }}
                                  >
                                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium truncate">{org.name}</p>
                                      <p className="text-xs text-muted-foreground truncate">{org.email}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                                      {org.type}
                                    </Badge>
                                  </button>
                                ))
                              )}
                              {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                                <p className="p-3 text-xs text-muted-foreground text-center">No results found</p>
                              )}
                            </div>
                          )}
                        </>
                      )}

                      {/* Create new customer mode */}
                      {linkMode === "create" && (
                        <div className="space-y-3 rounded-lg border p-3">
                          <div>
                            <Label htmlFor="customer-name" className="text-xs">Customer Name *</Label>
                            <Input
                              id="customer-name"
                              value={newCustomerName}
                              onChange={(e) => setNewCustomerName(e.target.value)}
                              placeholder="John Smith"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customer-email" className="text-xs">Email</Label>
                            <Input
                              id="customer-email"
                              type="email"
                              value={newCustomerEmail}
                              onChange={(e) => setNewCustomerEmail(e.target.value)}
                              placeholder="john@example.com"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customer-phone" className="text-xs">Phone</Label>
                            <Input
                              id="customer-phone"
                              type="tel"
                              value={newCustomerPhone}
                              onChange={(e) => setNewCustomerPhone(e.target.value)}
                              placeholder="(555) 123-4567"
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}

                      {/* Invite by email mode */}
                      {linkMode === "invite" && (
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="customer@email.com"
                            className="pl-9"
                          />
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            They&apos;ll receive an invite to join this project when they sign up.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                !name.trim() ||
                (linkMode === "create" && showOrgLinking && !selectedOrg && !newCustomerName.trim())
              }
            >
              {isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
