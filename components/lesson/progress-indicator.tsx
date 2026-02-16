"use client";

import { useEffect, useState } from "react";
import { isLessonComplete } from "@/lib/progress";
import { Badge } from "@/components/ui/badge";

interface ProgressIndicatorProps {
  moduleSlug: string;
  lessonSlug: string;
}

export function ProgressIndicator({
  moduleSlug,
  lessonSlug,
}: ProgressIndicatorProps) {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setCompleted(isLessonComplete(moduleSlug, lessonSlug));
  }, [moduleSlug, lessonSlug]);

  if (!completed) return null;

  return (
    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
      Completed
    </Badge>
  );
}
