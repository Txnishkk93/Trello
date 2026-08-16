import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Pencil, Check, X, ChevronLeft } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { Modal, ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "../components/ui/States";
import {
  createIssue,
  createSection,
  deleteSection,
  listIssuesByBoard,
  listSections,
  updateSection,
} from "../api/boards";
import { ApiRequestError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Issue, Section } from "../types";

export function BoardDetail() {
  const { orgId, boardId } = useParams<{ orgId: string; boardId: string }>();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[] | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [createSectionOpen, setCreateSectionOpen] = useState(false);
  const [createIssueFor, setCreateIssueFor] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteSectionTarget, setDeleteSectionTarget] = useState<Section | null>(null);
  const { push } = useToast();

  async function load() {
    if (!boardId) return;
    setError(null);
    try {
      const [sectionData, issueData] = await Promise.all([listSections(boardId), listIssuesByBoard(boardId)]);
      setSections(sectionData);
      setIssues(issueData);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load this board.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId]);

  async function saveRename(section: Section) {
    if (!editTitle.trim()) return;
    try {
      await updateSection(section.id, editTitle.trim());
      setEditingSectionId(null);
      load();
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't rename section.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Board"
        breadcrumb={
          <button onClick={() => navigate(`/orgs/${orgId}/boards`)} className="flex items-center gap-1 hover:text-ink2">
            <ChevronLeft className="size-3" />
            Boards
          </button>
        }
        action={
          <Button variant="primary" size="sm" onClick={() => setCreateSectionOpen(true)}>
            <Plus className="size-3.5" />
            New section
          </Button>
        }
      />

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-5">
        {sections === null && !error && (
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 w-64 shrink-0" />
            ))}
          </div>
        )}

        {error && <ErrorState message={error} onRetry={load} />}

        {sections && sections.length === 0 && (
          <EmptyState
            title="No sections yet"
            description="Sections organize issues into columns, like To do or In progress."
            action={
              <Button variant="secondary" size="sm" onClick={() => setCreateSectionOpen(true)}>
                <Plus className="size-3.5" />
                New section
              </Button>
            }
          />
        )}

        {sections && sections.length > 0 && (
          <div className="flex h-full gap-3">
            {sections.map((section) => {
              const sectionIssues = issues.filter((i) => i.sectionId === section.id);
              return (
                <div key={section.id} className="flex h-fit max-h-full w-64 shrink-0 flex-col rounded-md border border-line bg-surface">
                  <div className="group flex items-center justify-between border-b border-line px-3 py-2">
                    {editingSectionId === section.id ? (
                      <div className="flex flex-1 items-center gap-1">
                        <Input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveRename(section)}
                          className="h-7"
                        />
                        <Button variant="ghost" size="sm" onClick={() => saveRename(section)}>
                          <Check className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditingSectionId(null)}>
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-ink">{section.title}</span>
                          <span className="text-[10px] text-ink3">{sectionIssues.length}</span>
                        </div>
                        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSectionId(section.id);
                              setEditTitle(section.title);
                            }}
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteSectionTarget(section)}>
                            <Trash2 className="size-3 text-danger" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 overflow-y-auto p-2">
                    {sectionIssues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => navigate(`/orgs/${orgId}/boards/${boardId}/issues/${issue.id}`)}
                        className="rounded border border-line2 bg-surface2 px-2.5 py-2 text-left text-xs text-ink transition-colors hover:border-ink3"
                      >
                        <p className="line-clamp-2 font-medium">{issue.title}</p>
                        {issue.description && <p className="mt-0.5 line-clamp-1 text-ink3">{issue.description}</p>}
                      </button>
                    ))}

                    <button
                      onClick={() => setCreateIssueFor(section.id)}
                      className="flex items-center gap-1.5 rounded px-2 py-1.5 text-left text-xs text-ink3 transition-colors hover:bg-surface2 hover:text-ink2"
                    >
                      <Plus className="size-3" />
                      New issue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateSectionModal
        boardId={boardId!}
        open={createSectionOpen}
        onClose={() => setCreateSectionOpen(false)}
        onCreated={load}
      />

      {createIssueFor && (
        <CreateIssueModal
          boardId={boardId!}
          sectionId={createIssueFor}
          onClose={() => setCreateIssueFor(null)}
          onCreated={load}
        />
      )}

      <ConfirmDialog
        open={!!deleteSectionTarget}
        title="Delete section?"
        description={`This will permanently delete "${deleteSectionTarget?.title}" and every issue inside it.`}
        onCancel={() => setDeleteSectionTarget(null)}
        onConfirm={async () => {
          if (!deleteSectionTarget) return;
          try {
            await deleteSection(deleteSectionTarget.id);
            push("success", "Section deleted.");
            setDeleteSectionTarget(null);
            load();
          } catch (err) {
            push("error", err instanceof ApiRequestError ? err.message : "Couldn't delete section.");
          }
        }}
      />
    </div>
  );
}

function CreateSectionModal({
  boardId,
  open,
  onClose,
  onCreated,
}: {
  boardId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createSection(title, boardId);
      push("success", "Section created.");
      setTitle("");
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't create section.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New section">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Title">
          <Input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="To do" />
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

function CreateIssueModal({
  boardId,
  sectionId,
  onClose,
  onCreated,
}: {
  boardId: string;
  sectionId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await createIssue(title, sectionId, boardId, description || undefined);
      push("success", "Issue created.");
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't create issue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="New issue">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Title">
          <Input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fix login redirect bug" />
        </Field>
        <Field label="Description" hint="Optional">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more detail" />
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
