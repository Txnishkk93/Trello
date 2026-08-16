import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Trash2, UserPlus, X } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { ConfirmDialog, Modal } from "../components/ui/Modal";
import { ErrorState, Skeleton } from "../components/ui/States";
import { deleteIssue, getIssue, updateIssue, assignIssue, unassignIssue } from "../api/boards";
import { listMembers, type Member } from "../api/orgs";
import { ApiRequestError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Issue } from "../types";

export function IssueDetail() {
  const { orgId, boardId, issueId } = useParams<{ orgId: string; boardId: string; issueId: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const { push } = useToast();

  async function load() {
    if (!issueId || !orgId) return;
    setError(null);
    try {
      const [issueData, membersData] = await Promise.all([getIssue(issueId), listMembers(orgId)]);
      setIssue(issueData);
      setMembers(membersData);
      setTitle(issueData.title);
      setDescription(issueData.description ?? "");
      setDirty(false);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load this issue.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [issueId, orgId]);

  async function handleSave() {
    if (!issueId) return;
    setSaving(true);
    try {
      const updated = await updateIssue(issueId, { title, description });
      setIssue(updated);
      setDirty(false);
      push("success", "Issue updated.");
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't update issue.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(member: Member) {
    if (!issueId) return;
    setAssigning(true);
    try {
      await assignIssue(issueId, member.userId);
      push("success", `${member.username} assigned.`);
      setAssignOpen(false);
      load();
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't assign user.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleUnassign(userId: string, username: string) {
    if (!issueId) return;
    try {
      await unassignIssue(issueId, userId);
      push("success", `${username} unassigned.`);
      load();
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't unassign user.");
    }
  }

  const assignedUserIds = issue?.issueMappings?.map((m) => m.userId) || [];
  const unassignedMembers = members?.filter((m) => !assignedUserIds.includes(m.userId)) || [];

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Issue"
        breadcrumb={
          <button
            onClick={() => navigate(`/orgs/${orgId}/boards/${boardId}`)}
            className="flex items-center gap-1 hover:text-ink2"
          >
            <ChevronLeft className="size-3" />
            Board
          </button>
        }
        action={
          issue && (
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-3.5 text-danger" />
            </Button>
          )
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {!issue && !error && (
          <div className="mx-auto flex max-w-xl flex-col gap-3">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        )}

        {error && <ErrorState message={error} onRetry={load} />}

        {issue && (
          <div className="mx-auto flex max-w-xl flex-col gap-4">
            <Field label="Title">
              <Input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDirty(true);
                }}
                className="h-9 text-md"
              />
            </Field>

            <Field label="Description">
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
                rows={6}
                placeholder="Add more detail about this issue"
                className="w-full resize-none rounded border border-line2 bg-surface2 px-2.5 py-2 text-sm text-ink placeholder:text-ink3 outline-none transition-colors focus:border-ink3"
              />
            </Field>

            <div className="rounded-md border border-line bg-surface p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-ink">Assignees</span>
                {unassignedMembers.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setAssignOpen(true)}>
                    <UserPlus className="size-3.5" />
                  </Button>
                )}
              </div>
              
              {issue.issueMappings && issue.issueMappings.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {issue.issueMappings.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="flex items-center justify-between rounded bg-surface2 px-2 py-1.5 text-xs text-ink"
                    >
                      <span>{mapping.user.username}</span>
                      <button
                        onClick={() => handleUnassign(mapping.user.id, mapping.user.username)}
                        className="text-ink3 hover:text-danger transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-ink3">No one assigned yet</p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3">
              <span className="font-mono text-[10px] text-ink3">{issue.id}</span>
              <Button variant="primary" size="sm" disabled={!dirty} loading={saving} onClick={handleSave}>
                Save changes
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete issue?"
        description="This action cannot be undone."
        onCancel={() => setDeleteOpen(false)}
        onConfirm={async () => {
          if (!issueId) return;
          try {
            await deleteIssue(issueId);
            push("success", "Issue deleted.");
            navigate(`/orgs/${orgId}/boards/${boardId}`);
          } catch (err) {
            push("error", err instanceof ApiRequestError ? err.message : "Couldn't delete issue.");
          }
        }}
      />

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign member">
        <div className="space-y-2">
          {unassignedMembers.length === 0 ? (
            <p className="text-sm text-ink3">All members are already assigned to this issue.</p>
          ) : (
            unassignedMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => handleAssign(member)}
                disabled={assigning}
                className="w-full rounded border border-line bg-surface px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-surface2 disabled:opacity-50"
              >
                {member.username}
              </button>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
