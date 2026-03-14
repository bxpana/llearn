import { Module } from "./types";
import { promptEngineeringModule } from "@/content/prompt-engineering";
import { evaluationFrameworksModule } from "@/content/evaluation-frameworks";
import { retrievalFrameworksModule } from "@/content/retrieval-frameworks";

const modules: Module[] = [
  promptEngineeringModule,
  evaluationFrameworksModule,
  {
    slug: "agent-frameworks",
    title: "Agent Frameworks",
    description:
      "Design tool-using agents with planning loops and orchestration.",
    icon: "🤖",
    lessons: [],
    comingSoon: true,
  },
  retrievalFrameworksModule,
  {
    slug: "implementation-patterns",
    title: "LLM Implementation Patterns",
    description:
      "Streaming, tool use, multi-turn conversations, error handling, and token management.",
    icon: "⚙️",
    lessons: [],
    comingSoon: true,
  },
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
