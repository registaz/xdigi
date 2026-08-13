import type { TaskStatus } from "../types";

const STATUS_OPTIONS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To-do",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

interface StatusSelectProps {
  value: TaskStatus;
  disabled?: boolean;
  onChange: (status: TaskStatus) => void;
}

export function StatusSelect({ value, disabled, onChange }: StatusSelectProps) {
  return (
    <select
      className="status-select"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as TaskStatus)}
    >
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
