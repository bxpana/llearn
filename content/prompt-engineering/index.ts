import { Module } from "@/lib/types";
import { clearInstructions } from "./01-clear-instructions";
import { systemPrompts } from "./02-system-prompts";
import { fewShotExamples } from "./03-few-shot-examples";
import { chainOfThought } from "./04-chain-of-thought";
import { structuredOutput } from "./05-structured-output";
import { promptChaining } from "./06-prompt-chaining";
import { commonPitfalls } from "./07-common-pitfalls";

export const promptEngineeringModule: Module = {
  slug: "prompt-engineering",
  title: "Prompt Engineering",
  description:
    "Master the fundamentals of writing effective prompts — from clear instructions to advanced techniques like chain-of-thought and prompt chaining.",
  icon: "✍️",
  lessons: [
    clearInstructions,
    systemPrompts,
    fewShotExamples,
    chainOfThought,
    structuredOutput,
    promptChaining,
    commonPitfalls,
  ],
};
