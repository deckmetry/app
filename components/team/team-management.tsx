"use client";

import { useState, useTransition, useEffect } from "react";
import {
  listTeamMembers,
  listInvitations,
  inviteMember,
  updateMemberRole,
  removeMember,
  revokeInvitation,
  getOrgInfo,
} from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserPlus,
  MoreVertical,
  Shield,
  Crown,
  User,
  Eye,
  Clock,
  X,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type OrgRole = "owner" | "admin" | "member" | "viewer";

interface TeamMember {
  id: string;
  userId: string;
  role: OrgRole;
  createdAt: string;
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
}

interface Invitation {
  id: string;
  email: string;
  role: OrgRole;
  status: string;
  created_at: string;
  expires_at: string;
}

const roleIcons: Record<OrgRole, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  admin: Shield,
  member: User,
  viewer: Eye,
};

const roleBadgeColors: Record<OrgRole, string> = {
  owner: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  member: "bg-muted text-muted-foreground",
  viewer: "bg-muted text-muted-foreground",
};

export function TeamManagement() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [orgInfo, setOrgInfo] = useState<{
    name: string;
    type: string;
    seat_count: number;
  } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<OrgRole>("member");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    startTransition(async () => {
      const [memberData, inviteData, org] = await Promise.all([
        listTeamMembers(),
        listInvitations(),
        getOrgInfo(),
      ]);
      setMembers(memberData.members);
      setCurrentUserId(memberData.currentUserId);
      setInvitations(inviteData);
      setOrgInfo(org);
    });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUserRole =
    members.find((m) => m.userId === currentUserId)?.role ?? "member";
  const isOwnerOrAdmin =
    currentUserRole === "owner" || currentUserRole === "admin";
  const activeMembers = members.length;
  const pendingInvites = invitations.filter((i) => i.status === "pending").length;
  const seatCount = orgInfo?.seat_count ?? 1;
  const seatsUsed = activeMembers + pendingInvites;

  const handleInvite = () => {
    setError(null);
    startTransition(async () => {
      if (seatsUsed >= seatCount) {
        setError(
          `All ${seatCount} seat(s) are in use. Upgrade your plan to add more members.`
        );
        return;
      }

      const result = await inviteMember(inviteEmail.trim(), inviteRole);
      if (result.error) {
        setError(result.error);
      } else {
        setInviteEmail("");
        setInviteRole("member");
        setInviteOpen(false);
        setError(null);
        loadData();
      }
    });
  };

  const handleRoleChange = (membershipId: string, newRole: OrgRole) => {
    startTransition(async () => {
      const result = await updateMemberRole(membershipId, newRole);
      if (result.error) {
        setError(result.error);
      } else {
        loadData();
      }
    });
  };

  const handleRemove = (membershipId: string) => {
    startTransition(async () => {
      const result = await removeMember(membershipId);
      if (result.error) {
        setError(result.error);
      } else {
        loadData();
      }
    });
  };

  const handleRevoke = (invitationId: string) => {
    startTransition(async () => {
      const result = await revokeInvitation(invitationId);
      if (result.error) {
        setError(result.error);
      } else {
        loadData();
      }
    });
  };

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : "?";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-sm text-muted-foreground">
            Manage your organization&apos;s team members and invitations.
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as OrgRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      {currentUserRole === "owner" && (
                        <SelectItem value="admin">Admin</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isPending}
                >
                  {isPending ? "Sending..." : "Send Invitation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Seats usage */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Seats</p>
              <p className="text-xs text-muted-foreground">
                {activeMembers} member{activeMembers !== 1 ? "s" : ""} +{" "}
                {pendingInvites} pending invite{pendingInvites !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">
              {seatsUsed}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                / {seatCount}
              </span>
            </p>
            {seatsUsed >= seatCount && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                All seats used
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              seatsUsed >= seatCount ? "bg-amber-500" : "bg-primary"
            }`}
            style={{
              width: `${Math.min((seatsUsed / seatCount) * 100, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Error banner */}
      {error && !inviteOpen && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Members list */}
      <div>
        <h3 className="text-sm font-semibold mb-3">
          Members ({activeMembers})
        </h3>
        <div className="rounded-lg border divide-y">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role];
            const isCurrentUser = member.userId === currentUserId;
            const canManage = isOwnerOrAdmin && !isCurrentUser && member.role !== "owner";

            return (
              <div
                key={member.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.fullName, member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {member.fullName ?? member.email ?? "Unknown"}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          You
                        </Badge>
                      )}
                    </div>
                    {member.email && member.fullName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`gap-1 ${roleBadgeColors[member.role]}`}
                  >
                    <RoleIcon className="h-3 w-3" />
                    {member.role}
                  </Badge>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "member")}
                          disabled={member.role === "member"}
                        >
                          Set as Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(member.id, "viewer")}
                          disabled={member.role === "viewer"}
                        >
                          Set as Viewer
                        </DropdownMenuItem>
                        {currentUserRole === "owner" && (
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(member.id, "admin")}
                            disabled={member.role === "admin"}
                          >
                            Set as Admin
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              Remove from team
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove member?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.fullName ?? member.email} will lose
                                access to this organization. This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(member.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            );
          })}
          {members.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No team members found.
            </div>
          )}
        </div>
      </div>

      {/* Pending invitations */}
      {isOwnerOrAdmin && invitations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3">
            Invitations ({invitations.filter((i) => i.status === "pending").length}{" "}
            pending)
          </h3>
          <div className="rounded-lg border divide-y">
            {invitations.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited{" "}
                      {new Date(invite.created_at).toLocaleDateString()} &middot;{" "}
                      Expires{" "}
                      {new Date(invite.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      invite.status === "pending"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {invite.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {invite.role}
                  </Badge>
                  {invite.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRevoke(invite.id)}
                      disabled={isPending}
                      title="Revoke invitation"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
