import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const statusColors: Record<string, string> = {
  sent: "bg-blue-100 text-blue-800",
  viewed: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

function fmt(n: number) {
  return (
    "$" +
    Number(n).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default async function HomeownerProposalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_organization_id")
    .eq("id", user.id)
    .single();

  if (!profile?.default_organization_id) redirect("/dashboard");

  // Homeowners see quotes where their org's estimate was used
  const { data: quotes } = await supabase
    .from("quotes")
    .select(`
      id, quote_number, title, status, total, share_token,
      sent_at, approved_at, created_at,
      estimates (project_name)
    `)
    .in("status", ["sent", "viewed", "approved", "rejected"])
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Proposals</h1>
        <p className="text-muted-foreground">
          Proposals from contractors for your deck projects
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!quotes || quotes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No proposals yet</p>
              <p className="text-sm mt-1">
                When a contractor sends you a proposal, it will appear here
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map((q: any) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-mono text-sm">
                        {q.quote_number}
                      </TableCell>
                      <TableCell className="font-medium">
                        {q.estimates?.project_name ?? q.title}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[q.status] ?? ""}`}
                        >
                          {q.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {fmt(q.total)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(q.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {q.share_token && (
                          <Link href={`/proposals/${q.share_token}`}>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <ExternalLink className="h-3.5 w-3.5" />
                              View
                            </Button>
                          </Link>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
