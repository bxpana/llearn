import { Module } from "@/lib/types";
import { streaming } from "./01-streaming";
import { toolUse } from "./02-tool-use";
import { multiTurn } from "./03-multi-turn";
import { errorHandlingRetries } from "./04-error-handling-retries";
import { tokenManagement } from "./05-token-management";
import { safetyFiltering } from "./06-safety-filtering";

export const implementationPatternsModule: Module = {
  slug: "implementation-patterns",
  title: "LLM Implementation Patterns",
  description:
    "Streaming, tool use, multi-turn conversations, error handling, and token management.",
  icon: "\u2699\uFE0F",
  lessons: [
    streaming,
    toolUse,
    multiTurn,
    errorHandlingRetries,
    tokenManagement,
    safetyFiltering,
  ],
};
