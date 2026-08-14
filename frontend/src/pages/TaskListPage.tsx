import { useState } from "react";
import type { FormEvent } from "react";
import { tasksApi } from "../api/tasks";
import { developersApi } from "../api/developers";
import { useFetch, useAsyncAction } from "../hooks/useAsync";
import { TaskRow } from "../components/TaskRow";
import { Modal } from "../components/Modal";
import { NewTaskNode } from "../components/NewTaskNode";
import { createDraftTask, hasEmptyTitle } from "../utils/taskDraft";
import type { DraftTask } from "../utils/taskDraft";
import type { CreateTaskPayload } from "../types";

function toPayload(draft: DraftTask): CreateTaskPayload {
  return {
    title: draft.title.trim(),
    skills: draft.skills.length > 0 ? draft.skills : undefined,
    subtasks: draft.subtasks.length > 0 ? draft.subtasks.map(toPayload) : undefined,
  };
}

export function TaskListPage() {
  const tasksState = useFetch(() => tasksApi.list());
  const developersState = useFetch(() => developersApi.list());
  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState<DraftTask>(() => createDraftTask());
  const [showErrors, setShowErrors] = useState(false);
  const { run, loading: submitting, error: submitError } = useAsyncAction((payload: CreateTaskPayload) =>
    tasksApi.create(payload),
  );

  const loading = tasksState.loading || developersState.loading;
  const error = tasksState.error ?? developersState.error;
  const tasks = tasksState.data ?? [];

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (hasEmptyTitle(draft)) {
      setShowErrors(true);
      return;
    }
    const result = await run(toPayload(draft));
    if (result) {
      setShowModal(false);
      setDraft(createDraftTask());
      setShowErrors(false);
      tasksState.reload();
    }
  }

  function handleOpenModal() {
    setShowModal(true);
    setDraft(createDraftTask());
    setShowErrors(false);
  }

  function handleCloseModal() {
    setShowModal(false);
    setDraft(createDraftTask());
    setShowErrors(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="button button--primary" onClick={handleOpenModal}>
          + New Task
        </button>
      </div>

      {loading && <p className="hint">Loading…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Subtasks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No tasks yet. Create one to get started.
                  </td>
                </tr>
              )}
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  depth={0}
                  developers={developersState.data ?? []}
                  onChanged={tasksState.reload}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} title="Create Task" onClose={handleCloseModal}>
        <p className="hint">Leave skills unselected to have them inferred automatically from the title.</p>
        <form onSubmit={handleSubmit} className="create-task-form">
          <NewTaskNode draft={draft} depth={0} onChange={setDraft} showErrors={showErrors} />
          {submitError && <p className="error">{submitError}</p>}
          <div className="form-actions">
            <button type="button" className="button" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="button button--primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
