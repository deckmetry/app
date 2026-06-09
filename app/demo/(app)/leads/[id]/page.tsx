"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Mail, Phone, MapPin, Ruler, Layers, DollarSign, Clock, Globe, CheckCircle2, UserPlus,
} from "lucide-react";
import { getLead, contractors, formatCurrency, statusBadgeClass } from "../../../demo-data";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lead = getLead(id);
  if (!lead) notFound();

  const [status, setStatus] = useState(lead.status);
  const [assigned, setAssigned] = useState<string | null>(lead.assignedContractor);
  const [pick, setPick] = useState<string>("");
  const [flash, setFlash] = useState<string | null>(null);

  const assign = () => {
    if (!pick) return;
    const c = contractors.find((x) => x.id === pick);
    if (!c) return;
    setAssigned(c.company);
    setStatus("Assigned to Contractor");
    setFlash(`Lead assigned to ${c.company} and sent to ${c.rep ? "their portal" : "contractor"}.`);
  };

  const setStatusFlash = (s: typeof status, msg: string) => {
    setStatus(s);
    setFlash(msg);
  };

  return (
    <div className="space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 gap-1 text-muted-foreground -ml-2">
          <Link href="/demo/leads"><ArrowLeft className="h-4 w-4" /> Back to Homeowner Leads</Link>
        </Button>
        <PageHeader title={lead.name} description={lead.projectType}>
          <Badge variant="outline" className={statusBadgeClass(status)}>{status}</Badge>
        </PageHeader>
      </div>

      {flash && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {flash}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Homeowner Contact</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail icon={Mail} label="Email" value={lead.email} />
              <Detail icon={Phone} label="Phone" value={lead.phone} />
              <Detail icon={MapPin} label="City" value={lead.city} />
              <Detail icon={Globe} label="Source" value={lead.source} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Project Preferences</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Detail icon={Layers} label="Project Type" value={lead.projectType} />
              <Detail icon={Ruler} label="Deck Size" value={lead.deckSize} />
              <Detail icon={Layers} label="Material Interest" value={lead.preferredMaterial} />
              <Detail icon={DollarSign} label="Estimated Material Value" value={formatCurrency(lead.estimatedValue)} />
              <Detail icon={DollarSign} label="Budget Range" value={lead.budgetRange} />
              <Detail icon={Clock} label="Desired Timeline" value={lead.timeline} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{lead.notes}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><UserPlus className="h-4 w-4 text-muted-foreground" /> Assign to Contractor</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md bg-muted px-3 py-2 text-sm">
                <span className="text-muted-foreground">Currently assigned: </span>
                <span className="font-medium">{assigned ?? "Not assigned"}</span>
              </div>
              <Select value={pick} onValueChange={setPick}>
                <SelectTrigger><SelectValue placeholder="Select a contractor…" /></SelectTrigger>
                <SelectContent>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.company} · {c.rep}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full gap-2" onClick={assign} disabled={!pick}>
                <UserPlus className="h-4 w-4" /> Assign &amp; Send to Contractor
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Lead Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" onClick={() => setStatusFlash("Contractor Contacted", "Marked as contacted.")}>Mark Contacted</Button>
              <Button variant="outline" size="sm" onClick={() => setStatusFlash("Closed Won", "Lead marked Closed Won. 🎉")}>Mark Closed Won</Button>
              <Button variant="outline" size="sm" onClick={() => setStatusFlash("Lost", "Lead marked Lost.")}>Mark Lost</Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/demo/projects/smith-residence">Convert to Project</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}
