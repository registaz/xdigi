import type { Developer } from "../types";

interface DeveloperSelectProps {
  developers: Developer[];
  requiredSkills: string[];
  value: string | null;
  disabled?: boolean;
  onChange: (developerId: string | null) => void;
}

export function DeveloperSelect({ developers, requiredSkills, value, disabled, onChange }: DeveloperSelectProps) {
  const compatible = developers.filter((dev) => requiredSkills.every((skill) => dev.skills.includes(skill)));

  return (
    <select
      className="developer-select"
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value.length > 0 ? e.target.value : null)}
    >
      <option value="">Unassigned</option>
      {compatible.map((dev) => (
        <option key={dev.id} value={dev.id}>
          {dev.name}
        </option>
      ))}
    </select>
  );
}
