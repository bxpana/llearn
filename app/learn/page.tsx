import Link from "next/link";
import { getAllModules } from "@/lib/content";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LearnPage() {
  const modules = getAllModules();

  return (
    <div className="container px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight">All Modules</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a module to start learning. Each module contains interactive
          lessons with exercises you can complete at your own pace.
        </p>

        <div className="mt-8 grid gap-4">
          {modules.map((mod) => {
            const isAvailable = !mod.comingSoon && mod.lessons.length > 0;

            return (
              <Card
                key={mod.slug}
                className={!isAvailable ? "opacity-60" : undefined}
              >
                {isAvailable ? (
                  <Link href={`/learn/${mod.slug}`}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{mod.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              {mod.title}
                            </CardTitle>
                            <Badge variant="secondary">
                              {mod.lessons.length} lessons
                            </Badge>
                          </div>
                          <CardDescription className="mt-1">
                            {mod.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Link>
                ) : (
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mod.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {mod.title}
                          </CardTitle>
                          <Badge variant="outline">Coming Soon</Badge>
                        </div>
                        <CardDescription className="mt-1">
                          {mod.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
