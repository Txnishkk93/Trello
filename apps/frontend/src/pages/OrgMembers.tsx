import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Shield, Users, Trash2, Plus } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { Modal, ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, ErrorState, ListSkeleton } from "../components/ui/States";
import { listMembers, removeMembership, invite, type Member } from "../api/orgs";
import { ApiRequestError } from "../api/client";
import { useToast } from "../context/ToastContext";

export function OrgMembers() {
  const { orgId: rawOrgId } = useParams<{ orgId: string }>();
  const orgId = rawOrgId!; // Guaranteed by router, guarded below
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const { push } = useToast();
  const navigate = useNavigate();

  if (!rawOrgId) {
    return <ErrorState message="Organization not found" />;
  }

  async function load() {
    setError(null);
    try {
      const data = await listMembers(orgId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load members.");
    }
  }

  useEffect(() => {
    load();
  }, [orgId]);

  async function handleRemove(member: Member) {
    try {
      await removeMembership(member.userId, orgId);
      push("success", `${member.username} has been removed.`);
      setRemoveTarget(null);
      load();
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't remove member.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Organization Members"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {members === null && !error && <ListSkeleton rows={5} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {members && members.length === 0 && (
          <EmptyState
            title="No members yet"
            description="This organization has no members besides you."
          />
        )}

        {members && members.length > 0 && (
          <div className="space-y-3">
            <div className="rounded-md border border-line bg-surface p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <Users className="size-4" />
                {members.length} member{members.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="divide-y divide-line rounded-md border border-line bg-surface">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface2/50"
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{member.username}</span>
                      <span className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        member.role === "ADMIN"
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                          : "border-line2 text-ink3"
                      }`}>
                        {member.role === "ADMIN" && <Shield className="size-3" />}
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-ink2">
                      <Mail className="size-3" />
                      {member.email}
                    </div>
                  </div>

                  {member.role === "MEMBER" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemoveTarget(member)}
                      className="text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <InviteMemberModal
        open={inviteOpen}
        orgId={orgId}
        onClose={() => setInviteOpen(false)}
        onInvited={load}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove member?"
        description={`${removeTarget?.username} will no longer have access to this organization or its boards.`}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) handleRemove(removeTarget);
        }}
      />
    </div>
  );
}

function InviteMemberModal({
  open,
  orgId,
  onClose,
  onInvited,
}: {
  open: boolean;
  orgId: string;
  onClose: () => void;
  onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await invite(email.trim(), orgId);
      push("success", `Invitation sent to ${email}`);
      setEmail("");
      onClose();
      onInvited();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't send invitation.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite member">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Email address">
          <Input
            required
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="member@example.com"
          />
        </Field>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
