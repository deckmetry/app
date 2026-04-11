import { getProject } from "@/lib/actions/projects";
import { notFound } from "next/navigation";
import { TabsContent } from "@/components/ui/tabs";
import {
  ProjectDetailShell,
  OverviewTab,
} from "@/components/project/project-detail-shell";
import { DocumentsTab } from "@/components/project/documents-tab";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project | Deckmetry",
};

export default async function SupplierProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const docCount =
    (project.estimates?.length ?? 0) +
    (project.supplier_estimates?.length ?? 0) +
    (project.quotes?.length ?? 0) +
    (project.approvals?.length ?? 0) +
    (project.orders?.length ?? 0) +
    (project.invoices?.length ?? 0) +
    (project.deliveries?.length ?? 0);

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "documents", label: "Documents", count: docCount },
  ];

  return (
    <ProjectDetailShell
      project={project}
      backHref="/supplier/projects"
      backLabel="Back to Projects"
      tabs={tabs}
    >
      <TabsContent value="overview">
        <OverviewTab project={project} />
      </TabsContent>
      <TabsContent value="documents">
        <DocumentsTab project={project} role="supplier" />
      </TabsContent>
    </ProjectDetailShell>
  );
}
