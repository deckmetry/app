"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateCustomer,
  archiveCustomer,
} from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Pencil,
  Check,
  X,
  Archive,
  Loader2,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────

interface SharedProject {
  id: string;
  name: string;
  project_number: string;
  status: string;
  created_at: string;
}

export interface CustomerDetail {
  id: string;
  customer_org_id: string;
  notes: string | null;
  status: string;
  created_at: string;
  organizations: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    type: string;
  };
  project_count: number;
  projects: SharedProject[];
}

interface CustomerDetailClientProps {
  customer: CustomerDetail;
  role: "contractor" | "supplier";
}

// ─── Status config ──────────────────────────────────────────

const statusColors: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  archived: "bg-muted text-muted-foreground",
};

const projectStatusConfig: Record<string, { label: string; color: string }> = {
  bom_created: {
    label: "BOM Created",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  estimate_requested: {
    label: "Estimate Requested",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
  proposal_sent: {
    label: "Proposal Sent",
    color:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  },
  agreement_signed: {
    label: "Agreement Signed",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  complete: {
    label: "Complete",
    color:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

// ─── Component ──────────────────────────────────────────────

export function CustomerDetailClient({
  customer,
  role,
}: CustomerDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Notes editing
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(customer.notes ?? "");

  const basePath = `/${role}/customers`;
  const projectBasePath = `/${role}/projects`;

  function handleSaveNotes() {
    startTransition(async () => {
      const result = await updateCustomer(customer.id, {
        notes: notesValue.trim() || undefined,
      });
      if (result.success) {
        setIsEditingNotes(false);
        router.refresh();
      }
    });
  }

  function handleCancelNotes() {
    setNotesValue(customer.notes ?? "");
    setIsEditingNotes(false);
  }

  function handleArchive() {
    startTransition(async () => {
      const result = await archiveCustomer(customer.id);
      if (result.success) {
        router.push(basePath);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={basePath}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {customer.organizations.name}
            </h1>
            <Badge
              variant="secondary"
              className={cn(
                "capitalize",
                statusColors[customer.status] ?? statusColors.active
              )}
            >
              {customer.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Customer since{" "}
            {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>

        {customer.status !== "archived" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-muted-foreground"
                disabled={isPending}
              >
                <Archive className="h-4 w-4" />
                Archive Customer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive this customer?</AlertDialogTitle>
                <AlertDialogDescription>
                  {customer.organizations.name} will be moved to your archived
                  customers. You can still view their history but they
                  won&apos;t appear in your active customer list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleArchive}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    "Archive"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Contact info card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Email</p>
              {customer.organizations.email ? (
                <a
                  href={`mailto:${customer.organizations.email}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:underline"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {customer.organizations.email}
                </a>
              ) : (
                <p className="text-muted-foreground">--</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              {customer.organizations.phone ? (
                <a
                  href={`tel:${customer.organizations.phone}`}
                  className="inline-flex items-center gap-1.5 font-medium hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {customer.organizations.phone}
                </a>
              ) : (
                <p className="text-muted-foreground">--</p>
              )}
            </div>
            {customer.organizations.address && (
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="inline-flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {customer.organizations.address}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Added</p>
              <p className="inline-flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Notes</CardTitle>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setIsEditingNotes(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add internal notes about this customer..."
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleSaveNotes}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleCancelNotes}
                  disabled={isPending}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {customer.notes || "No notes yet. Click edit to add some."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Shared projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Shared Projects ({customer.projects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customer.projects.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed p-8 text-center">
              <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-semibold">No shared projects</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Projects linked to this customer will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {customer.projects.map((project) => {
                const statusInfo = projectStatusConfig[project.status] ?? {
                  label: project.status,
                  color: "bg-muted text-muted-foreground",
                };

                return (
                  <Link key={project.id} href={`${projectBasePath}/${project.id}`}>
                    <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                      <CardContent className="flex items-center justify-between py-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {project.project_number}
                            </span>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px]",
                                statusInfo.color
                              )}
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <h3 className="mt-1 text-sm font-semibold truncate">
                            {project.name}
                          </h3>
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0 ml-4">
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
