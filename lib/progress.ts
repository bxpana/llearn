import { AllProgress, LessonProgress } from "./types";

const STORAGE_KEY = "llearn-progress";

function getAll(): AllProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(progress: AllProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function getLessonProgress(
  moduleSlug: string,
  lessonSlug: string
): LessonProgress {
  const all = getAll();
  return all[moduleSlug]?.[lessonSlug] ?? { completed: false };
}

export function markLessonComplete(
  moduleSlug: string,
  lessonSlug: string
): void {
  const all = getAll();
  if (!all[moduleSlug]) all[moduleSlug] = {};
  all[moduleSlug][lessonSlug] = {
    completed: true,
    lastAttempt: new Date().toISOString(),
  };
  saveAll(all);
}

export function getModuleCompletionCount(moduleSlug: string): {
  completed: number;
  total: number;
} {
  const all = getAll();
  const moduleProgress = all[moduleSlug] ?? {};
  const completed = Object.values(moduleProgress).filter(
    (p) => p.completed
  ).length;
  return { completed, total: 0 }; // total set by caller
}

export function isLessonComplete(
  moduleSlug: string,
  lessonSlug: string
): boolean {
  return getLessonProgress(moduleSlug, lessonSlug).completed;
}
