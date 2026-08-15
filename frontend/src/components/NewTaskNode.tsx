import { useLayoutEffect, useRef } from "react";
import type { DraftTask } from "../utils/taskDraft";
import { createDraftTask } from "../utils/taskDraft";

const AVAILABLE_SKILLS = ["Frontend", "Backend"];

interface NewTaskNodeProps {
  draft: DraftTask;
  depth: number;
  onChange: (updated: DraftTask) => void;
  onRemove?: () => void;
  showErrors: boolean;
}

function autoResize(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function NewTaskNode({ draft, depth, onChange, onRemove, showErrors }: NewTaskNodeProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    autoResize(titleRef.current);
  }, [draft.title]);

  function updateTitle(title: string) {
    onChange({ ...draft, title });
  }

  function toggleSkill(skill: string) {
    const skills = draft.skills.includes(skill) ? draft.skills.filter((s) => s !== skill) : [...draft.skills, skill];
    onChange({ ...draft, skills });
  }

  function addSubtask() {
    onChange({ ...draft, subtasks: [...draft.subtasks, createDraftTask()] });
  }

  function updateSubtask(index: number, updated: DraftTask) {
    onChange({ ...draft, subtasks: draft.subtasks.map((s, i) => (i === index ? updated : s)) });
  }

  function removeSubtask(index: number) {
    onChange({ ...draft, subtasks: draft.subtasks.filter((_, i) => i !== index) });
  }

  const showTitleError = showErrors && draft.title.trim().length === 0;

  return (
    <div className={`task-node${depth > 0 ? " task-node--nested" : ""}`}>
      <div className="task-node-row">
        <textarea
          ref={titleRef}
          className={`task-title-input${showTitleError ? " field-invalid" : ""}`}
          placeholder="Task title"
          value={draft.title}
          onChange={(e) => {
            updateTitle(e.target.value);
            autoResize(e.target);
          }}
          rows={1}
        />
        <div className="skill-checkboxes">
          {AVAILABLE_SKILLS.map((skill) => (
            <label key={skill} className="skill-checkbox">
              <input type="checkbox" checked={draft.skills.includes(skill)} onChange={() => toggleSkill(skill)} />
              {skill}
            </label>
          ))}
        </div>
        <div className="task-node-actions">
          <button type="button" onClick={addSubtask}>
            + Add Subtask
          </button>
          {onRemove && (
            <button type="button" className="remove-button" onClick={onRemove}>
              Remove
            </button>
          )}
        </div>
      </div>
      {showTitleError && <p className="field-error">Title is required</p>}
      {draft.subtasks.length > 0 && (
        <div className="subtask-list">
          {draft.subtasks.map((sub, index) => (
            <NewTaskNode
              key={sub.key}
              draft={sub}
              depth={depth + 1}
              onChange={(updated) => updateSubtask(index, updated)}
              onRemove={() => removeSubtask(index)}
              showErrors={showErrors}
            />
          ))}
        </div>
      )}
    </div>
  );
}
