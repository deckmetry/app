"use client";

import { useState, useTransition } from "react";
import { shareProject, revokeProjectShare } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, UserPlus, X, Check, Clock, Ban } from "lucide-react";

interface Share {
  id: string;
  shared_with_email: string;
  permission: string;
  status: string;
  accepted_at: string | null;
  created_at: string;
}

interface ProjectSharingProps {
  projectId: string;
  shares: Share[];
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  accepted: <Check className="h-3.5 w-3.5 text-emerald-500" />,
  revoked: <Ban className="h-3.5 w-3.5 text-muted-foreground" />,
};

export function ProjectSharing({ projectId, shares }: ProjectSharingProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setSuccess(false);

    startTransition(async () => {
      const result = await shareProject(projectId, email.trim());
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setEmail("");
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  }

  function handleRevoke(shareId: string) {
    startTransition(async () => {
      await revokeProjectShare(shareId);
    });
  }

  const activeShares = shares.filter((s) => s.status !== "revoked");
  const revokedShares = shares.filter((s) => s.status === "revoked");

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4" />
            Share This Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Invite someone to view this project. They will be able to see all
            project documents including BOMs, estimates, proposals, and orders.
          </p>
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="spouse@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>
            <Button type="submit" disabled={isPending} size="default">
              {isPending ? "Sending..." : "Invite"}
            </Button>
          </form>
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
          {success && (
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
              Invitation sent successfully!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Active shares */}
      {activeShares.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shared With</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcons[share.status]}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {share.shared_with_email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {share.status === "pending" ? "Invitation pending" : "Accepted"}
                        {" — "}
                        {share.permission === "edit" ? "Can edit" : "View only"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {share.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevoke(share.id)}
                      disabled={isPending}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Revoked shares (collapsed) */}
      {revokedShares.length > 0 && (
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">
              Revoked ({revokedShares.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revokedShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span className="truncate">{share.shared_with_email}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
