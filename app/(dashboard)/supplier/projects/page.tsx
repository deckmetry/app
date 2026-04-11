import { listProjects } from "@/lib/actions/projects";
import { ProjectList } from "@/components/project/project-list";
import { PageHeader } from "@/components/page-header";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Deckmetry",
};

export default async function SupplierProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Projects where your organization is a materials supplier."
      >
        <CreateProjectDialog role="supplier" />
      </PageHeader>
      <ProjectList projects={projects} basePath="/supplier/projects" />
    </div>
  );
}
