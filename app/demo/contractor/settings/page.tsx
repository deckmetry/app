import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2, User, Mail, Phone, MapPin, Store, UserCheck, Percent, CreditCard, UserPlus,
} from "lucide-react";
import { companySettings, teamMembers } from "../../contractor-data";

export default function ContractorSettingsPage() {
  const c = companySettings;
  return (
    <div className="space-y-8">
      <PageHeader title="Company Settings" description="Your company profile, Wehrung's relationship, and team." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company profile */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Company Profile</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail icon={Building2} label="Company Name" value={c.companyName} />
            <Detail icon={User} label="Main Contact" value={c.contact} />
            <Detail icon={Mail} label="Email" value={c.email} />
            <Detail icon={Phone} label="Phone" value={c.phone} />
            <Detail icon={MapPin} label="Address" value={c.address} />
            <Detail icon={Store} label="Preferred Wehrung's Location" value={c.preferredLocation} />
          </CardContent>
        </Card>

        {/* Wehrung's relationship */}
        <Card>
          <CardHeader><CardTitle className="text-base">Wehrung&apos;s Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Detail icon={UserCheck} label="Assigned Wehrung's Rep" value={c.rep} />
            <Detail icon={Percent} label="Contractor Discount Level" value={c.discountLevel} />
            <Detail icon={CreditCard} label="Payment Terms" value={c.paymentTerms} />
          </CardContent>
        </Card>
      </div>

      {/* Team members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Team Members ({teamMembers.length})</CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5"><UserPlus className="h-3.5 w-3.5" /> Invite Member</Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((m) => (
                  <TableRow key={m.email}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">{m.role}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{m.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
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
