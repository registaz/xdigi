import { Modal } from "./Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  taskTitle: string;
  descendantCount: number;
  loading?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  isOpen,
  taskTitle,
  descendantCount,
  loading,
  error,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  return (
    <Modal isOpen={isOpen} title="Delete task" onClose={onCancel}>
      <p>
        Are you sure you want to delete <strong>{taskTitle}</strong>?
      </p>
      {descendantCount > 0 && (
        <p className="error">
          This task has {descendantCount} subtask{descendantCount === 1 ? "" : "s"}. Deleting it will also
          permanently delete {descendantCount === 1 ? "that subtask" : "all of those subtasks"}.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="button" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="button button--danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </Modal>
  );
}
