export type WorkTask = Readonly<{
  id: string;
  title: string;
  done: boolean;
}>;
export type WorkNote = Readonly<{
  id: string;
  title: string;
  content: string;
}>;

export function createTask(tasks: readonly WorkTask[], id: string, title: string) {
  const clean = title.trim();
  if (!clean || clean.length > 200 || tasks.length >= 40 || tasks.some(x => x.id === id)) return null;
  return { id, title: clean, done: false } as WorkTask;
}

export function toggleTask(tasks: readonly WorkTask[], id: string): WorkTask[] {
  return tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
}

export function deleteTask(tasks: readonly WorkTask[], id: string): WorkTask[] {
  return tasks.filter(t => t.id !== id);
}

export function filterTasks(tasks: readonly WorkTask[], visibility: "all" | "open" | "done"): WorkTask[] {
  if (visibility === "open") return tasks.filter(t => !t.done);
  if (visibility === "done") return tasks.filter(t => t.done);
  return [...tasks];
}

export function createNote(notes: readonly WorkNote[], id: string, title: string, content: string): WorkNote | null {
  const cleanTitle = title.trim(), cleanContent = content.trim();
  if (!cleanTitle || !cleanContent || cleanTitle.length > 160 ||
      cleanContent.length > 6000 || notes.length >= 30 ||
      notes.some(x => x.id === id)) return null;
  return { id, title: cleanTitle, content: cleanContent };
}

export function deleteNote(notes: readonly WorkNote[], id: string): WorkNote[] {
  return notes.filter(n => n.id !== id);
}
