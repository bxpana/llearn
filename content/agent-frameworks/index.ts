import { Module } from "@/lib/types";
import { whenToUseAgents } from "./01-when-to-use-agents";
import { toolDesign } from "./02-tool-design";
import { agentLoop } from "./03-agent-loop";
import { planningDecomposition } from "./04-planning-decomposition";
import { errorHandling } from "./05-error-handling";
import { multiAgent } from "./06-multi-agent";

export const agentFrameworksModule: Module = {
  slug: "agent-frameworks",
  title: "Agent Frameworks",
  description:
    "Design tool-using agents with planning loops and orchestration.",
  icon: "🤖",
  lessons: [
    whenToUseAgents,
    toolDesign,
    agentLoop,
    planningDecomposition,
    errorHandling,
    multiAgent,
  ],
};
