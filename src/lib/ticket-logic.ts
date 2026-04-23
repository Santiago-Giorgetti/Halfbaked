import type { ChecklistItem, MainStatus } from "@/types/ticket";

export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { key: "backend", label: "Backend listo", done: false },
  { key: "testing", label: "Testing completo", done: false },
  { key: "qa", label: "Asignado a QA", done: false }
];

export function isComplete(checklist: ChecklistItem[]): boolean {
  return checklist.length > 0 && checklist.every((item) => item.done);
}

export function progress(checklist: ChecklistItem[]): number {
  if (checklist.length === 0) return 0;
  const done = checklist.filter((item) => item.done).length;
  return Math.round((done / checklist.length) * 100);
}

export function isInconsistent(mainStatus: MainStatus, checklist: ChecklistItem[]): boolean {
  return mainStatus === "DONE" && !isComplete(checklist);
}

export function progressFraction(checklist: ChecklistItem[]): string {
  const done = checklist.filter((item) => item.done).length;
  return `${done}/${checklist.length}`;
}

export function humanizeLabel(label: string): string {
  return label
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
