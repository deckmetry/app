import { listProjects } from "@/lib/actions/projects";
import { ProjectList } from "@/components/project/project-list";
import { PageHeader } from "@/components/page-header";
import { CreateProjectDialog } from "@/components/project/create-project-dialog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Projects | Deckmetry",
};

export default async function HomeownerProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Projects"
        description="Track your deck projects from estimate to completion."
      >
        <CreateProjectDialog role="homeowner" />
      </PageHeader>
      <ProjectList projects={projects} basePath="/homeowner/projects" />
    </div>
  );
}
