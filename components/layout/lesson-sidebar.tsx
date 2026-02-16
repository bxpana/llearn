"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Lesson } from "@/lib/types";
import { isLessonComplete } from "@/lib/progress";

interface LessonSidebarProps {
  moduleSlug: string;
  lessons: Lesson[];
}

export function LessonSidebar({ moduleSlug, lessons }: LessonSidebarProps) {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0 border-r pr-4">
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Lessons
      </h3>
      <ul className="space-y-1">
        {lessons.map((lesson) => {
          const href = `/learn/${moduleSlug}/${lesson.slug}`;
          const isActive = pathname === href;
          const completed = isLessonComplete(moduleSlug, lesson.slug);

          return (
            <li key={lesson.slug}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground font-medium"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs",
                    completed
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {completed ? "✓" : lesson.order}
                </span>
                <span className="truncate">{lesson.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
