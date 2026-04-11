"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string }> = {
  bom_created: { label: "BOM Created", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" },
  estimate_requested: { label: "Estimate Requested", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  estimate_received: { label: "Estimate Received", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" },
  proposal_sent: { label: "Proposal Sent", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  proposal_viewed: { label: "Proposal Viewed", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300" },
  agreement_signed: { label: "Agreement Signed", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  po_submitted: { label: "PO Submitted", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  po_confirmed: { label: "PO Confirmed", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300" },
  materials_shipped: { label: "Shipped", color: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300" },
  materials_delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  complete: { label: "Complete", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

interface Project {
  id: string;
  name: string;
  address: string | null;
  status: string;
  project_number: string;
  created_at: string;
  project_stakeholders?: { organization_id: string; role: string }[];
}

interface ProjectListProps {
  projects: Project[];
  basePath: string;
}

export function ProjectList({ projects, basePath }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed p-12 text-center">
        <FolderOpen className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first deck estimate to start a project.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {projects.map((project) => {
        const statusInfo = statusConfig[project.status] ?? {
          label: project.status,
          color: "bg-muted text-muted-foreground",
        };

        return (
          <Link key={project.id} href={`${basePath}/${project.id}`}>
            <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
              <CardContent className="flex items-center justify-between py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {project.project_number}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px]", statusInfo.color)}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold truncate">
                    {project.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    {project.address && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {project.address}
                      </span>
                    )}
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
