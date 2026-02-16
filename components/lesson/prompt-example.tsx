import { LessonExample, PromptExample } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface PromptExampleViewProps {
  example: LessonExample;
}

export function PromptExampleView({ example }: PromptExampleViewProps) {
  return (
    <section>
      <h3 className="text-lg font-semibold">Example</h3>
      <p className="mt-1 text-sm text-muted-foreground">{example.scenario}</p>

      <div className="mt-4 space-y-6">
        {example.bad && (
          <div>
            <Badge variant="destructive" className="mb-2">
              Before — Without the pattern
            </Badge>
            <PromptResponsePair example={example.bad} variant="bad" />
          </div>
        )}

        <div>
          <Badge
            variant="default"
            className="mb-2 bg-green-600 hover:bg-green-700"
          >
            After — With the pattern
          </Badge>
          <PromptResponsePair example={example.good} variant="good" />
        </div>
      </div>
    </section>
  );
}

function PromptResponsePair({
  example,
  variant,
}: {
  example: PromptExample;
  variant: "good" | "bad";
}) {
  return (
    <div className="space-y-3">
      {example.systemPrompt && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            System Prompt
          </div>
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {example.systemPrompt}
          </pre>
        </div>
      )}

      <div className="rounded-lg border p-3">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-600">
          User
        </div>
        <pre className="whitespace-pre-wrap text-sm font-mono">
          <AnnotatedText
            text={example.userMessage}
            annotations={example.annotations}
          />
        </pre>
      </div>

      <div
        className={`rounded-lg border p-3 ${
          variant === "good" ? "bg-green-50/50 border-green-200" : "bg-red-50/50 border-red-200"
        }`}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Assistant
        </div>
        <pre className="whitespace-pre-wrap text-sm font-mono">
          <AnnotatedText
            text={example.assistantResponse}
            annotations={example.annotations}
          />
        </pre>
      </div>
    </div>
  );
}

function AnnotatedText({
  text,
  annotations,
}: {
  text: string;
  annotations?: { text: string; note: string }[];
}) {
  if (!annotations || annotations.length === 0) {
    return <>{text}</>;
  }

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  for (const annotation of annotations) {
    const idx = remaining.indexOf(annotation.text);
    if (idx === -1) continue;

    if (idx > 0) {
      parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
    }

    parts.push(
      <span
        key={key++}
        className="relative inline bg-yellow-100 border-b-2 border-yellow-400 cursor-help group"
        title={annotation.note}
      >
        {annotation.text}
        <span className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden w-64 rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
          {annotation.note}
        </span>
      </span>
    );

    remaining = remaining.slice(idx + annotation.text.length);
  }

  if (remaining) {
    parts.push(<span key={key++}>{remaining}</span>);
  }

  return <>{parts}</>;
}
