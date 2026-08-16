import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ArrowRight, Trash2, UserPlus, Check, Users } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { Modal, ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, ErrorState, ListSkeleton } from "../components/ui/States";
import { acceptInvite, createOrg, deleteOrg, invite, listOrgs } from "../api/orgs";
import { ApiRequestError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Organization } from "../types";

export function Organizations() {
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Organization | null>(null);
  const [acceptOrgId, setAcceptOrgId] = useState("");
  const { push } = useToast();
  const navigate = useNavigate();

  async function load() {
    setError(null);
    try {
      const data = await listOrgs();
      setOrgs(data);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load organizations.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptOrgId.trim()) return;
    try {
      await acceptInvite(acceptOrgId.trim());
      push("success", "Invite accepted.");
      setAcceptOrgId("");
      load();
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't accept invite.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Organizations"
        action={
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            New organization
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        <form onSubmit={handleAccept} className="mb-5 flex items-end gap-2 rounded-md border border-line bg-surface p-3">
          <Field label="Have an invite? Enter the organization ID to accept it">
            <Input value={acceptOrgId} onChange={(e) => setAcceptOrgId(e.target.value)} placeholder="org id" className="w-64" />
          </Field>
          <Button type="submit" size="sm" variant="secondary">
            <Check className="size-3.5" />
            Accept
          </Button>
        </form>

        {orgs === null && !error && <ListSkeleton rows={3} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {orgs && orgs.length === 0 && (
          <EmptyState
            title="No organizations yet"
            description="Create your first organization to start building boards with your team."
            action={
              <Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-3.5" />
                New organization
              </Button>
            }
          />
        )}

        {orgs && orgs.length > 0 && (
          <div className="flex flex-col divide-y divide-line rounded-md border border-line bg-surface">
            {orgs.map((org) => (
              <div key={org.id} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-surface2/50">
                <button
                  onClick={() => navigate(`/orgs/${org.id}/boards`)}
                  className="flex flex-1 flex-col items-start gap-0.5 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{org.username}</span>
                    <span className="rounded-sm border border-line2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink3">
                      {org.role}
                    </span>
                  </div>
                  {org.description && <span className="text-xs text-ink2">{org.description}</span>}
                  <span className="font-mono text-[10px] text-ink3">{org.id}</span>
                </button>

                <div className="flex items-center gap-1">
                  {org.role === "ADMIN" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/orgs/${org.id}/members`)}>
                        <Users className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setInviteOpen(org.id)}>
                        <UserPlus className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(org)}>
                        <Trash2 className="size-3.5 text-danger" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/orgs/${org.id}/boards`)}>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateOrgModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
      {inviteOpen && <InviteModal orgId={inviteOpen} onClose={() => setInviteOpen(null)} />}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete organization?"
        description={`This will permanently delete "${deleteTarget?.username}" and every board, section, and issue inside it. This action cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteOrg(deleteTarget.id);
            push("success", "Organization deleted.");
            setDeleteTarget(null);
            load();
          } catch (err) {
            push("error", err instanceof ApiRequestError ? err.message : "Couldn't delete organization.");
          }
        }}
      />
    </div>
  );
}

function CreateOrgModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createOrg(username, description);
      push("success", "Organization created.");
      setUsername("");
      setDescription("");
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't create organization.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New organization">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Name">
          <Input required autoFocus value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Acme Inc." />
        </Field>
        <Field label="Description" hint="Optional">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this organization for?" />
        </Field>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function InviteModal({ orgId, onClose }: { orgId: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await invite(email, orgId);
      push("success", `Invited ${email}.`);
      onClose();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't send invite.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Invite a member">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Email">
          <Input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" />
        </Field>
        {error && <p className="text-xs text-danger">{error}</p>}
        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Send invite
          </Button>
        </div>
      </form>
    </Modal>
  );
}
