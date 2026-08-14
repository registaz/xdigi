import { useState } from "react";
import type { ReactNode } from "react";
import type { Developer, Task, TaskStatus } from "../types";
import { StatusSelect } from "./StatusSelect";
import { DeveloperSelect } from "./DeveloperSelect";
import { SkillBadges } from "./SkillBadges";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";
import { tasksApi } from "../api/tasks";
import { useAsyncAction } from "../hooks/useAsync";

interface TaskRowProps {
  task: Task;
  depth: number;
  developers: Developer[];
  onChanged: () => void;
  isLast?: boolean;
  hidden?: boolean;
}

function countSubtasks(task: Task): number {
  return task.subtasks.reduce((sum, sub) => sum + 1 + countSubtasks(sub), 0);
}

function CollapsibleCell({ collapsed, className, children }: { collapsed: boolean; className?: string; children: ReactNode }) {
  return (
    <td className={className}>
      <div className={`cell-collapse${collapsed ? " cell-collapse--collapsed" : ""}`}>
        <div className="cell-collapse-inner">{children}</div>
      </div>
    </td>
  );
}

export function TaskRow({ task, depth, developers, onChanged, isLast = true, hidden = false }: TaskRowProps) {
  const { run, loading, error } = useAsyncAction((payload: { status?: TaskStatus; developerId?: string | null }) =>
    tasksApi.update(task.id, payload),
  );
  const {
    run: runDelete,
    loading: deleting,
    error: deleteError,
  } = useAsyncAction(async () => {
    await tasksApi.remove(task.id);
    return true;
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const hasSubtasks = task.subtasks.length > 0;

  async function handleStatusChange(status: TaskStatus) {
    const result = await run({ status });
    if (result) onChanged();
  }

  async function handleDeveloperChange(developerId: string | null) {
    const result = await run({ developerId });
    if (result) onChanged();
  }

  async function handleConfirmDelete() {
    const result = await runDelete();
    if (result) {
      setShowDeleteModal(false);
      onChanged();
    }
  }

  return (
    <>
      <tr className={[depth > 0 ? "task-row--nested" : "", hidden ? "task-row--hidden" : ""].filter(Boolean).join(" ") || undefined}>
        <CollapsibleCell collapsed={hidden} className="task-title-cell">
          {depth > 0 && (
            <span
              className={`tree-guide tree-guide--${isLast ? "elbow" : "tee"}`}
              style={{ marginLeft: `${(depth - 1) * 1.25}rem` }}
              aria-hidden="true"
            />
          )}
          {hasSubtasks ? (
            <button
              type="button"
              className={`task-toggle${expanded ? "" : " task-toggle--collapsed"}`}
              onClick={() => setExpanded((prev) => !prev)}
              aria-expanded={expanded}
              aria-label={expanded ? "Collapse subtasks" : "Expand subtasks"}
            >
              ▶
            </button>
          ) : (
            <span className="task-toggle-spacer" aria-hidden="true" />
          )}
          <span className={`task-title-text${depth === 0 ? " task-title-text--root" : ""}`}>{task.title}</span>
          {hasSubtasks && !expanded && <span className="task-collapsed-count">{countSubtasks(task)}</span>}
        </CollapsibleCell>
        <CollapsibleCell collapsed={hidden}>
          <SkillBadges skills={task.skills} />
        </CollapsibleCell>
        <CollapsibleCell collapsed={hidden}>
          <StatusSelect value={task.status} disabled={loading} onChange={handleStatusChange} />
        </CollapsibleCell>
        <CollapsibleCell collapsed={hidden}>
          <DeveloperSelect
            developers={developers}
            requiredSkills={task.skills}
            value={task.developer?.id ?? null}
            disabled={loading}
            onChange={handleDeveloperChange}
          />
        </CollapsibleCell>
        <CollapsibleCell collapsed={hidden}>{countSubtasks(task)}</CollapsibleCell>
        <CollapsibleCell collapsed={hidden}>
          <button type="button" className="button button--danger" onClick={() => setShowDeleteModal(true)}>
            Delete
          </button>
        </CollapsibleCell>
      </tr>
      {error && (
        <tr>
          <td colSpan={6} className="row-error">
            {error}
          </td>
        </tr>
      )}
      {task.subtasks.map((sub, index) => (
        <TaskRow
          key={sub.id}
          task={sub}
          depth={depth + 1}
          isLast={index === task.subtasks.length - 1}
          developers={developers}
          onChanged={onChanged}
          hidden={hidden || !expanded}
        />
      ))}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        taskTitle={task.title}
        descendantCount={countSubtasks(task)}
        loading={deleting}
        error={deleteError}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
