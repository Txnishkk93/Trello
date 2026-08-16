import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, LayoutGrid, Pencil, Trash2, Check, X } from "lucide-react";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Input";
import { Modal, ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, ErrorState, ListSkeleton } from "../components/ui/States";
import { createBoard, deleteBoard, listBoards, updateBoard } from "../api/boards";
import { ApiRequestError } from "../api/client";
import { useToast } from "../context/ToastContext";
import type { Board } from "../types";

export function Boards() {
  const { orgId } = useParams<{ orgId: string }>();
  const [boards, setBoards] = useState<Board[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Board | null>(null);
  const { push } = useToast();
  const navigate = useNavigate();

  async function load() {
    if (!orgId) return;
    setError(null);
    try {
      setBoards(await listBoards(orgId));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't load boards.");
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId]);

  async function saveRename(board: Board) {
    if (!editTitle.trim()) return;
    try {
      await updateBoard(board.id, editTitle.trim());
      setEditingId(null);
      load();
    } catch (err) {
      push("error", err instanceof ApiRequestError ? err.message : "Couldn't rename board.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Boards"
        action={
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-3.5" />
            New board
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5">
        {boards === null && !error && <ListSkeleton rows={3} />}
        {error && <ErrorState message={error} onRetry={load} />}

        {boards && boards.length === 0 && (
          <EmptyState
            title="No boards yet"
            description="Create a board to start organizing sections and issues."
            action={
              <Button variant="secondary" size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="size-3.5" />
                New board
              </Button>
            }
          />
        )}

        {boards && boards.length > 0 && (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group flex flex-col gap-3 rounded-md border border-line bg-surface p-3.5 transition-colors hover:border-line2"
              >
                {editingId === board.id ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && saveRename(board)}
                    />
                    <Button variant="ghost" size="sm" onClick={() => saveRename(board)}>
                      <Check className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/orgs/${orgId}/boards/${board.id}`)}
                    className="flex items-center gap-2 text-left"
                  >
                    <LayoutGrid className="size-3.5 shrink-0 text-ink3" strokeWidth={1.75} />
                    <span className="truncate text-sm font-medium text-ink">{board.title}</span>
                  </button>
                )}

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-ink3">{board.id.slice(0, 8)}</span>
                  <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(board.id);
                        setEditTitle(board.title);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(board)}>
                      <Trash2 className="size-3.5 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBoardModal orgId={orgId!} open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete board?"
        description={`This will permanently delete "${deleteTarget?.title}" and every section and issue inside it.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await deleteBoard(deleteTarget.id);
            push("success", "Board deleted.");
            setDeleteTarget(null);
            load();
          } catch (err) {
            push("error", err instanceof ApiRequestError ? err.message : "Couldn't delete board.");
          }
        }}
      />
    </div>
  );
}

function CreateBoardModal({
  orgId,
  open,
  onClose,
  onCreated,
}: {
  orgId: string;
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
      await createBoard(title, orgId);
      push("success", "Board created.");
      setTitle("");
      onClose();
      onCreated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Couldn't create board.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New board">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Field label="Title">
          <Input required autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product roadmap" />
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
