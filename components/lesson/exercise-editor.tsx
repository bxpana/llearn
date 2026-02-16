"use client";

import { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { Exercise } from "@/lib/types";
import { validate } from "@/lib/validation";
import { markLessonComplete } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { CopyToClaude } from "./copy-to-claude";

interface ExerciseEditorProps {
  exercise: Exercise;
  moduleSlug: string;
  lessonSlug: string;
  onComplete?: () => void;
}

export function ExerciseEditor({
  exercise,
  moduleSlug,
  lessonSlug,
  onComplete,
}: ExerciseEditorProps) {
  const [code, setCode] = useState(exercise.starterCode);
  const [results, setResults] = useState<
    { message: string; passed: boolean }[] | null
  >(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [passed, setPassed] = useState(false);

  const handleCheck = useCallback(() => {
    const result = validate(code, exercise.validation);
    setResults(
      result.results.map((r) => ({
        message: r.rule.message,
        passed: r.passed,
      }))
    );
    setAttempts((a) => a + 1);

    if (result.passed) {
      setPassed(true);
      markLessonComplete(moduleSlug, lessonSlug);
      onComplete?.();
    }
  }, [code, exercise.validation, moduleSlug, lessonSlug, onComplete]);

  const handleShowHint = () => {
    if (hintsShown < exercise.hints.length) {
      setHintsShown((h) => h + 1);
    }
  };

  return (
    <section>
      <h3 className="text-lg font-semibold">Exercise</h3>
      <div className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
        {renderExerciseInstructions(exercise.instructions)}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border">
        <CodeMirror
          value={code}
          onChange={setCode}
          extensions={[markdown()]}
          minHeight="200px"
          maxHeight="500px"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
          }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button onClick={handleCheck} disabled={passed}>
          {passed ? "Passed!" : "Check My Prompt"}
        </Button>
        <CopyToClaude text={code} />
        {exercise.hints.length > 0 && hintsShown < exercise.hints.length && (
          <Button variant="ghost" size="sm" onClick={handleShowHint}>
            Show Hint ({hintsShown}/{exercise.hints.length})
          </Button>
        )}
        {attempts >= 2 && !showSolution && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSolution(true)}
          >
            Show Solution
          </Button>
        )}
      </div>

      {results && (
        <div className="mt-4 space-y-2">
          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                r.passed
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              <span className="shrink-0">{r.passed ? "✓" : "✗"}</span>
              <span>{r.message}</span>
            </div>
          ))}
        </div>
      )}

      {passed && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Exercise complete! You can move on to the next lesson or keep
            refining your prompt.
          </p>
        </div>
      )}

      {hintsShown > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold">Hints</h4>
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="rounded-md bg-muted px-3 py-2 text-sm">
              {hint}
            </div>
          ))}
        </div>
      )}

      {showSolution && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold">Sample Solution</h4>
          <div className="mt-2 overflow-hidden rounded-lg border bg-muted/50">
            <pre className="p-4 text-sm whitespace-pre-wrap font-mono">
              {exercise.sampleSolution}
            </pre>
          </div>
        </div>
      )}
    </section>
  );
}

function renderExerciseInstructions(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return <span key={i}>{part}</span>;
  });
}
