import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule, getAllModules } from "@/lib/content";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function generateStaticParams() {
  return getAllModules()
    .filter((m) => !m.comingSoon)
    .map((m) => ({ module: m.slug }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);

  if (!mod || mod.comingSoon) {
    notFound();
  }

  return (
    <div className="container px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{mod.icon}</span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mod.title}</h1>
            <p className="mt-1 text-muted-foreground">{mod.description}</p>
          </div>
        </div>

        <div className="mt-2 text-sm text-muted-foreground">
          {mod.lessons.length} lessons
        </div>

        <div className="mt-8 space-y-3">
          {mod.lessons.map((lesson) => (
            <Card key={lesson.slug}>
              <Link href={`/learn/${mod.slug}/${lesson.slug}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {lesson.order}
                    </span>
                    <div>
                      <CardTitle className="text-base">
                        {lesson.title}
                      </CardTitle>
                      <CardDescription>{lesson.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Link href={`/learn/${mod.slug}/${mod.lessons[0].slug}`}>
            <Button size="lg">Start First Lesson</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
