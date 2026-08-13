export interface DraftTask {
  key: string;
  title: string;
  skills: string[];
  subtasks: DraftTask[];
}

export function createDraftTask(): DraftTask {
  return { key: crypto.randomUUID(), title: "", skills: [], subtasks: [] };
}

export function hasEmptyTitle(draft: DraftTask): boolean {
  return draft.title.trim().length === 0 || draft.subtasks.some(hasEmptyTitle);
}
