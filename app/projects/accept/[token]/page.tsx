import { acceptProjectShare } from "@/lib/actions/projects";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hexagon, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

export default async function AcceptSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Check if user is logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login with next param to come back here
    redirect(`/login?next=/projects/accept/${token}`);
  }

  // Try to accept the share
  const result = await acceptProjectShare(token);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Hexagon className="h-6 w-6 text-primary-foreground" />
          </div>
          {result.success ? (
            <>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle>Project Shared With You</CardTitle>
            </>
          ) : (
            <>
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle>Unable to Accept</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {result.success ? (
            <>
              <p className="text-sm text-muted-foreground">
                You now have access to this project. You can view all project
                documents including BOMs, estimates, proposals, and orders.
              </p>
              <Link href={`/homeowner/projects/${result.projectId}`}>
                <Button className="w-full">View Project</Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {result.error ?? "Something went wrong."}
              </p>
              <Link href="/homeowner/projects">
                <Button variant="outline" className="w-full">
                  Go to My Projects
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
