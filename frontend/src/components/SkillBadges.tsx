interface SkillBadgesProps {
  skills: string[];
}

export function SkillBadges({ skills }: SkillBadgesProps) {
  if (skills.length === 0) {
    return <span className="skill-badge skill-badge--empty">No skills</span>;
  }
  return (
    <div className="skill-badges">
      {skills.map((skill) => (
        <span key={skill} className="skill-badge">
          {skill}
        </span>
      ))}
    </div>
  );
}
