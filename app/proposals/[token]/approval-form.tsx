"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Loader2 } from "lucide-react";
import { approveProposal } from "./actions";

interface ApprovalFormProps {
  quoteId: string;
  organizationId: string;
  quoteNumber: string;
  total: number;
  token: string;
}

export function ApprovalForm({
  quoteId,
  organizationId,
  quoteNumber,
  total,
  token,
}: ApprovalFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please enter your name and email");
      return;
    }

    setLoading(true);
    setError("");

    const result = await approveProposal({
      quoteId,
      organizationId,
      signerName: name,
      signerEmail: email,
      total,
      quoteNumber,
    });

    if (!result.success) {
      setError(result.error ?? "Failed to approve");
      setLoading(false);
      return;
    }

    setApproved(true);
    setLoading(false);
    router.refresh();
  };

  if (approved) {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          <div>
            <p className="font-semibold text-emerald-800">
              Proposal approved!
            </p>
            <p className="text-sm text-emerald-700">
              A confirmation has been recorded. The contractor will be notified.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Approve This Proposal</CardTitle>
        <CardDescription>
          By approving, you authorize the contractor to proceed with the work
          described above for the total of $
          {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="signer-name">Your Name</Label>
            <Input
              id="signer-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signer-email">Your Email</Label>
            <Input
              id="signer-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
        </div>
        <Button
          onClick={handleApprove}
          disabled={loading}
          className="w-full gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Approve Proposal
        </Button>
      </CardContent>
    </Card>
  );
}
