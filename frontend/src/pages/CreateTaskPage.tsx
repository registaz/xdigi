import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { tasksApi } from "../api/tasks";
import { useAsyncAction } from "../hooks/useAsync";
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

export function CreateTaskPage() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<DraftTask>(() => createDraftTask());
  const [showErrors, setShowErrors] = useState(false);
  const { run, loading, error } = useAsyncAction((payload: CreateTaskPayload) => tasksApi.create(payload));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (hasEmptyTitle(draft)) {
      setShowErrors(true);
      return;
    }
    const result = await run(toPayload(draft));
    if (result) {
      navigate("/");
    }
  }

  return (
    <div className="page">
      <h1>Create Task</h1>
      <p className="hint">
        Leave skills unselected to have them inferred automatically from the title.
      </p>
      <form onSubmit={handleSubmit} className="create-task-form">
        <NewTaskNode draft={draft} depth={0} onChange={setDraft} showErrors={showErrors} />
        {error && <p className="error">{error}</p>}
        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={loading}>
            {loading ? "Creating…" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
