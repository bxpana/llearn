import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="py-20 md:py-32">
      <div className="container px-4 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Learn LLM Patterns
            <br />
            <span className="text-muted-foreground">by Doing</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Interactive exercises to master prompt engineering, evaluation
            frameworks, agent patterns, and retrieval-augmented generation. No
            API key required — learn the patterns, not the billing.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/learn/prompt-engineering/clear-instructions">
              <Button size="lg">Start Learning</Button>
            </Link>
            <Link href="/learn">
              <Button variant="outline" size="lg">
                Browse Modules
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
