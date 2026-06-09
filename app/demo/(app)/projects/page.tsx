import { PageHeader } from "@/components/page-header";
import { ProjectsTable } from "./projects-table";

export default function DemoProjectsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects / Orders"
        description="Every contractor project and material order request across Wehrung's — organized before it enters Epicor."
      />
      <ProjectsTable />
    </div>
  );
}
