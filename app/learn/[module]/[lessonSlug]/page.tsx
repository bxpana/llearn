import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule, getLesson, getAdjacentLessons, getAllModules } from "@/lib/content";
import { LessonContent } from "@/components/lesson/lesson-content";
import { PromptExampleView } from "@/components/lesson/prompt-example";
import { ExerciseEditor } from "@/components/lesson/exercise-editor";
import { ProgressIndicator } from "@/components/lesson/progress-indicator";
import { LessonSidebar } from "@/components/layout/lesson-sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function generateStaticParams() {
  const modules = getAllModules();
  const params: { module: string; lessonSlug: string }[] = [];

  for (const mod of modules) {
    if (mod.comingSoon) continue;
    for (const lesson of mod.lessons) {
      params.push({ module: mod.slug, lessonSlug: lesson.slug });
    }
  }

  return params;
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ module: string; lessonSlug: string }>;
}) {
  const { module: moduleSlug, lessonSlug } = await params;
  const mod = getModule(moduleSlug);
  const lesson = getLesson(moduleSlug, lessonSlug);

  if (!mod || !lesson) {
    notFound();
  }

  const { prev, next } = getAdjacentLessons(moduleSlug, lessonSlug);

  return (
    <div className="container flex gap-8 px-4 py-8 md:px-8">
      <div className="hidden lg:block">
        <LessonSidebar moduleSlug={moduleSlug} lessons={mod.lessons} />
      </div>

      <div className="min-w-0 flex-1 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {lesson.order}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {lesson.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lesson.description}
            </p>
          </div>
          <ProgressIndicator moduleSlug={moduleSlug} lessonSlug={lessonSlug} />
        </div>

        <Separator className="my-6" />

        <LessonContent content={lesson.content} />

        <Separator className="my-8" />

        <PromptExampleView example={lesson.example} />

        <Separator className="my-8" />

        <ExerciseEditor
          exercise={lesson.exercise}
          moduleSlug={moduleSlug}
          lessonSlug={lessonSlug}
        />

        <Separator className="my-8" />

        <div className="flex justify-between">
          {prev ? (
            <Link href={`/learn/${moduleSlug}/${prev.slug}`}>
              <Button variant="outline">
                ← {prev.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link href={`/learn/${moduleSlug}/${next.slug}`}>
              <Button>
                {next.title} →
              </Button>
            </Link>
          ) : (
            <Link href={`/learn/${moduleSlug}`}>
              <Button>Back to Module Overview</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
