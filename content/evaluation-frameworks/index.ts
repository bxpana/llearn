import { Module } from "@/lib/types";
import { whatAreEvals } from "./01-what-are-evals";
import { designingTestCases } from "./02-designing-test-cases";
import { scoringCriteria } from "./03-scoring-criteria";
import { evalDrivenIteration } from "./04-eval-driven-iteration";
import { productionEvalSuites } from "./05-production-eval-suites";
import { evalStrategy } from "./06-eval-strategy";

export const evaluationFrameworksModule: Module = {
  slug: "evaluation-frameworks",
  title: "Evaluation Frameworks",
  description:
    "Build evals to measure and improve LLM output quality — from test case design to organizational adoption.",
  icon: "📊",
  lessons: [
    whatAreEvals,
    designingTestCases,
    scoringCriteria,
    evalDrivenIteration,
    productionEvalSuites,
    evalStrategy,
  ],
};
