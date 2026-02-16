import { Hero } from "@/components/landing/hero";
import { ModuleCard } from "@/components/landing/module-card";
import { getAllModules } from "@/lib/content";

export default function HomePage() {
  const modules = getAllModules();

  return (
    <>
      <Hero />
      <section className="border-t pb-20">
        <div className="container px-4 py-12 md:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">Modules</h2>
            <p className="mt-2 text-muted-foreground">
              Each module covers a key area of applied AI engineering with
              hands-on exercises.
            </p>
            <div className="mt-6 grid gap-3">
              {modules.map((mod) => (
                <ModuleCard key={mod.slug} module={mod} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
