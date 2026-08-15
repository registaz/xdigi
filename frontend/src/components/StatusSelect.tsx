import type { TaskStatus } from "../types";
import { STATUS_LABELS, STATUS_OPTIONS } from "../utils/statusLabels";

interface StatusSelectProps {
  value: TaskStatus;
  disabled?: boolean;
  onChange: (status: TaskStatus) => void;
}

const STATUS_CLASSES: Record<TaskStatus, string> = {
  TODO: "status-select--todo",
  IN_PROGRESS: "status-select--in-progress",
  DONE: "status-select--done",
};

export function StatusSelect({ value, disabled, onChange }: StatusSelectProps) {
  return (
    <select
      className={`status-select ${STATUS_CLASSES[value]}`}
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
