import { listQuotes } from "@/lib/actions/quotes";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { RealtimeRefresh } from "@/components/realtime-refresh";

function QuoteStatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "outline" | "destructive"; label: string }> = {
    draft: { variant: "outline", label: "Draft" },
    sent: { variant: "secondary", label: "Sent" },
    viewed: { variant: "secondary", label: "Viewed" },
    approved: { variant: "default", label: "Approved" },
    rejected: { variant: "destructive", label: "Rejected" },
    expired: { variant: "outline", label: "Expired" },
  };
  const c = config[status] ?? { variant: "outline" as const, label: status };
  return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default async function ContractorQuotesPage() {
  const quotes = await listQuotes();

  return (
    <div className="space-y-6">
      <RealtimeRefresh table="quotes" />
      <PageHeader
        title="Quotes & Proposals"
        description="Manage your quotes, share proposals, and track approvals."
      />

      {quotes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No quotes yet"
          description="Go to an estimate and click &quot;Quote&quot; to create your first proposal."
          actionLabel="View Estimates"
          actionHref="/contractor/estimates"
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Created</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q: any) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-sm">
                    {q.quote_number}
                  </TableCell>
                  <TableCell className="font-medium">
                    {q.title || "Untitled"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {q.estimates?.project_name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${Number(q.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(q.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {q.share_token && (
                        <Link href={`/proposals/${q.share_token}`} target="_blank">
                          <Button variant="ghost" size="sm" className="gap-1.5">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
