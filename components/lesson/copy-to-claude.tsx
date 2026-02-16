"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CopyToClaudeProps {
  text: string;
}

export function CopyToClaude({ text }: CopyToClaudeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy to try in Claude.ai"}
    </Button>
  );
}
