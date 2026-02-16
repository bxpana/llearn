import { LessonContent as LessonContentType } from "@/lib/types";

interface LessonContentProps {
  content: LessonContentType;
}

export function LessonContent({ content }: LessonContentProps) {
  return (
    <section>
      <div className="prose prose-neutral max-w-none">
        {content.explanation.split("\n\n").map((paragraph, i) => {
          if (paragraph.startsWith("- **") || paragraph.startsWith("1.")) {
            return (
              <ul key={i} className="mt-3 space-y-1">
                {paragraph.split("\n").map((line, j) => {
                  const match = line.match(
                    /^[-\d.]+\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)/
                  );
                  if (match) {
                    return (
                      <li key={j} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {match[1]}
                        </span>{" "}
                        — {match[2]}
                      </li>
                    );
                  }
                  const simpleMatch = line.match(/^[-\d.]+\s+\*\*(.+?)\*\*(.*)/);
                  if (simpleMatch) {
                    return (
                      <li key={j} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {simpleMatch[1]}
                        </span>
                        {simpleMatch[2]}
                      </li>
                    );
                  }
                  return (
                    <li key={j} className="text-sm text-muted-foreground">
                      {line.replace(/^[-\d.]+\s+/, "")}
                    </li>
                  );
                })}
              </ul>
            );
          }
          return (
            <p key={i} className="mt-3 text-sm leading-relaxed text-muted-foreground first:mt-0">
              {renderInlineMarkdown(paragraph)}
            </p>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border bg-muted/50 p-4">
        <h4 className="text-sm font-semibold">Why this matters</h4>
        <p className="mt-1 text-sm text-muted-foreground">
          {content.whyItMatters}
        </p>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold">Key Principles</h4>
        <ul className="mt-2 space-y-2">
          {content.keyPrinciples.map((principle, i) => {
            const parts = principle.split(" — ");
            return (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">
                  {parts.length > 1 ? (
                    <>
                      <span className="font-medium text-foreground">{parts[0]}</span>
                      {" — "}
                      {parts.slice(1).join(" — ")}
                    </>
                  ) : (
                    principle
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
