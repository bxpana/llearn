import { Module } from "./types";
import { promptEngineeringModule } from "@/content/prompt-engineering";
import { evaluationFrameworksModule } from "@/content/evaluation-frameworks";
import { agentFrameworksModule } from "@/content/agent-frameworks";
import { retrievalFrameworksModule } from "@/content/retrieval-frameworks";
import { implementationPatternsModule } from "@/content/implementation-patterns";

const modules: Module[] = [
  promptEngineeringModule,
  evaluationFrameworksModule,
  agentFrameworksModule,
  retrievalFrameworksModule,
  implementationPatternsModule,
];

export function getAllModules(): Module[] {
  return modules;
}

export function getModule(slug: string): Module | undefined {
  return modules.find((m) => m.slug === slug);
}

export function getLesson(moduleSlug: string, lessonSlug: string) {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  return mod.lessons.find((l) => l.slug === lessonSlug);
}

export function getAdjacentLessons(moduleSlug: string, lessonSlug: string) {
  const mod = getModule(moduleSlug);
  if (!mod) return { prev: undefined, next: undefined };

  const idx = mod.lessons.findIndex((l) => l.slug === lessonSlug);
  return {
    prev: idx > 0 ? mod.lessons[idx - 1] : undefined,
    next: idx < mod.lessons.length - 1 ? mod.lessons[idx + 1] : undefined,
  };
}
