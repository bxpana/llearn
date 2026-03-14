import { Lesson } from "@/lib/types";

export const planningDecomposition: Lesson = {
  slug: "planning-decomposition",
  title: "Planning and Decomposition",
  description:
    "Teach agents to break complex tasks into subtasks and revise plans as new information emerges.",
  order: 4,
  content: {
    explanation: `Complex tasks overwhelm agents just like they overwhelm humans. An agent asked to "research the competitive landscape of the EV market and write a strategic report" will produce shallow, unfocused work if it tries to tackle everything at once. Planning and decomposition — breaking a complex task into manageable subtasks and executing them in a structured order — is what makes agents effective on real-world problems.

**Upfront Planning vs. Incremental Planning**

There are two fundamental approaches:

**Upfront planning** means the agent creates a complete plan before executing any steps. This works well when the task structure is predictable: "Step 1: Gather market data. Step 2: Analyze competitors. Step 3: Identify trends. Step 4: Write report." The advantage is clarity and structure. The risk is that the plan may be wrong — real-world research often reveals surprises that invalidate the original plan.

**Incremental planning** means the agent plans only the next 1-2 steps, executes them, then plans again based on what it learned. This is more adaptive and handles surprises well, but can lead to unfocused exploration without a clear direction. The agent may lose sight of the overall goal.

**The best approach combines both**: create an initial high-level plan (3-5 major phases), then plan each phase incrementally as you enter it. This gives you structure without rigidity.

**Re-Planning After New Information**

Plans should not be treated as immutable. When the agent discovers something unexpected — a key data source is unavailable, the competitive landscape is more complex than expected, or a new angle emerges — it should explicitly re-plan. The re-planning step should acknowledge what changed, how it affects the original plan, and what the revised approach is.

A common prompt pattern for re-planning is: "After completing each step, evaluate whether your plan is still valid. If you've learned something that changes the approach, revise your plan before continuing. State what changed and why."

**The Detail vs. Flexibility Tradeoff**

Highly detailed plans ("Step 1a: Search for Tesla revenue 2020-2024. Step 1b: Search for BYD revenue 2020-2024. Step 1c: ...") are easy to execute but brittle — any deviation requires replanning from scratch. High-level plans ("Step 1: Gather financial data for key players") are flexible but give the agent less guidance. The sweet spot is **milestone-level planning**: define what each step should accomplish (the milestone) without prescribing exactly how to accomplish it.

**Decomposition Strategies**

Different tasks benefit from different decomposition strategies:

- **Sequential decomposition** — tasks where each step depends on the previous one. Research before analysis before writing.
- **Parallel decomposition** — independent subtasks that can be executed in any order. Gathering data from three different sources.
- **Hierarchical decomposition** — break a task into phases, then break each phase into steps. Most effective for complex, multi-hour tasks.
- **Goal-based decomposition** — define what success looks like for the overall task, then identify what sub-goals must be achieved. Work backward from the desired output.

The key is to make the decomposition strategy explicit in the system prompt rather than hoping the agent will figure out how to break down tasks on its own.`,
    whyItMatters:
      "Without planning and decomposition, agents attempt complex tasks in a single unstructured pass, producing shallow and incomplete results. Teaching agents to plan, execute incrementally, and revise based on new information produces dramatically better output on multi-step tasks. It also makes agent behavior more predictable and debuggable since each step has a clear purpose.",
    keyPrinciples: [
      "Combine upfront high-level planning with incremental step-level planning for the best balance of structure and adaptability",
      "Plans are living documents — instruct the agent to re-plan explicitly when new information changes the approach",
      "Use milestone-level granularity: define what each step should accomplish without prescribing exactly how",
      "Make the decomposition strategy explicit in the system prompt rather than expecting the agent to invent one",
    ],
  },
  example: {
    scenario:
      "An agent is asked to research and write a comparison of three cloud providers' AI/ML services.",
    bad: {
      systemPrompt: `You are a research agent with access to web search and page reading tools. Research topics thoroughly and write comprehensive reports.`,
      userMessage: `Research and write a detailed comparison of AWS, Google Cloud, and Azure AI/ML services. Cover pricing, features, ease of use, and ecosystem. The report should be useful for a CTO deciding which platform to adopt.`,
      assistantResponse: `I'll research this topic for you.

[Calling web_search("AWS vs Google Cloud vs Azure AI ML comparison")]
Result: Various comparison articles from 2023-2024...

[Calling web_search("cloud AI ML pricing comparison")]
Result: Pricing pages and blog posts...

[Calling web_search("best cloud for machine learning 2024")]
Result: Reviews and rankings...

[Calling web_search("AWS SageMaker features")]
Result: AWS documentation...

[Calling web_search("Google Vertex AI features")]
Result: Google Cloud documentation...

[Calling web_search("Azure Machine Learning features")]
Result: Microsoft documentation...

[Calling web_search("cloud AI ease of use")]
Result: Blog posts and reviews...

[Calling web_search("cloud ML ecosystem integrations")]
Result: Various articles...

## Cloud AI/ML Comparison

AWS, Google Cloud, and Azure all offer comprehensive AI/ML services. AWS has SageMaker, Google has Vertex AI, and Azure has Azure Machine Learning. Each has strengths and weaknesses in pricing, features, and ease of use. AWS is the market leader, Google excels at AI research, and Azure integrates well with Microsoft products. Pricing varies by service and usage...

(report continues with surface-level comparisons lacking specific data)`,
      annotations: [
        {
          text: "Research topics thoroughly and write comprehensive reports",
          note: "No planning instructions at all. The agent jumps straight into unfocused searching with no structure for how to approach a complex multi-faceted comparison.",
        },
        {
          text: "[Calling web_search(\"AWS vs Google Cloud vs Azure AI ML comparison\")]",
          note: "All 8 searches happened without a plan. The agent is searching reactively rather than following a structured research approach. No decomposition of the task into phases.",
        },
        {
          text: "Each has strengths and weaknesses in pricing, features, and ease of use",
          note: "The output is superficial because the research was unstructured. Without decomposing the task into specific comparison dimensions, the agent gathered broad information but no deep insights.",
        },
      ],
    },
    good: {
      systemPrompt: `You are a research agent with access to web_search and read_page tools.

## Planning Instructions
Before starting research, create a plan with 3-5 high-level phases. For each phase, define:
- What the phase should accomplish (the milestone)
- What specific information you need to find
- How you'll know the phase is complete

## Execution
Execute one phase at a time. After completing each phase:
1. Summarize what you learned
2. Check if your plan is still valid
3. Revise the plan if new information changes your approach
4. Move to the next phase

## Re-Planning
If you discover something that changes the scope or direction, STOP and revise your plan before continuing. State what changed and why.`,
      userMessage: `Research and write a detailed comparison of AWS, Google Cloud, and Azure AI/ML services. Cover pricing, features, ease of use, and ecosystem. The report should be useful for a CTO deciding which platform to adopt.`,
      assistantResponse: `## Initial Plan

This is a complex comparison across 4 dimensions and 3 providers. I'll decompose it into phases:

**Phase 1: Feature Inventory** — For each provider, identify the core AI/ML services and their key capabilities. Milestone: a feature matrix covering all 3 providers.

**Phase 2: Pricing Analysis** — Gather pricing models and representative costs for common workloads. Milestone: a pricing comparison table with actual numbers.

**Phase 3: Ease of Use & Ecosystem** — Research developer experience, documentation quality, third-party integrations. Milestone: qualitative comparison with specific examples.

**Phase 4: Synthesis** — Write the comparison report with a recommendation framework. Milestone: structured report suitable for CTO decision-making.

---

### Executing Phase 1: Feature Inventory

I need specific feature lists for each provider's ML platform. Let me start with AWS SageMaker.

[Calling web_search("AWS SageMaker features capabilities 2024")]
Result: SageMaker offers Studio, training, inference endpoints, Ground Truth labeling...

[Calling web_search("Google Vertex AI features capabilities 2024")]
Result: Vertex AI includes AutoML, custom training, Model Garden, feature store...

[Calling web_search("Azure Machine Learning features 2024")]
Result: Azure ML has designer, automated ML, pipelines, managed endpoints...

**Phase 1 Complete.** I have the core feature sets for all three providers. My plan is still valid — moving to Phase 2.

### Executing Phase 2: Pricing Analysis

[Calling web_search("AWS SageMaker pricing per hour training instance")]
Result: ml.m5.xlarge at $0.23/hr, ml.p3.2xlarge (GPU) at $3.825/hr...

[Calling web_search("Google Vertex AI pricing training costs")]
Result: n1-standard-4 at $0.19/hr, NVIDIA T4 GPU at $0.35/hr added...

**Plan Revision:** I'm discovering that pricing structures are very different across providers — AWS charges per instance, Google uses a base + accelerator model, Azure has a reservation discount. I need to compare on a common workload rather than raw prices. Adding a sub-step to Phase 2: define a reference workload and estimate total cost for each provider.

[Calling web_search("Azure Machine Learning pricing compute instances GPU")]
Result: Standard_NC6s_v3 (V100 GPU) at $3.06/hr, reservations save up to 72%...

**Phase 2 Complete.** I have pricing data and identified structural differences. Revised plan is on track.

(continues through Phases 3 and 4...)

## Cloud AI/ML Platform Comparison

### Feature Comparison
| Capability | AWS SageMaker | Google Vertex AI | Azure ML |
|---|---|---|---|
| AutoML | Autopilot | AutoML (tabular, vision, text) | Automated ML |
| Custom Training | ✅ Script mode | ✅ Custom containers | ✅ Command jobs |
| GPU Options | P3, P4d, Inf1 | T4, A100, TPU v4 | NC, ND series |
| MLOps | Pipelines + Registry | Pipelines + Registry | Pipelines + Registry |
| Unique Strength | Broadest service ecosystem | TPU access + AI research | Enterprise integration |

### Pricing (reference: training a medium model for 100 hours on 1 GPU)
- **AWS:** ~$383 (p3.2xlarge) | Savings: Reserved instances (-40%)
- **Google:** ~$254 (A100 via Vertex) | Savings: Committed use (-57%)
- **Azure:** ~$306 (NC6s_v3) | Savings: Reservations (-72%)

(full report continues with ease of use, ecosystem analysis, and recommendation framework)`,
      annotations: [
        {
          text: "## Initial Plan",
          note: "The agent starts with a structured plan before any tool calls. Four phases with clear milestones — this ensures the research is focused and complete.",
        },
        {
          text: "Phase 1 Complete.",
          note: "After each phase, the agent summarizes what it found and checks if the plan is still valid. This disciplined approach prevents drift and ensures progress.",
        },
        {
          text: "Plan Revision:",
          note: "When pricing structures turned out more complex than expected, the agent explicitly revised its plan rather than producing a superficial comparison. This adaptation produces better output.",
        },
        {
          text: "reference: training a medium model for 100 hours",
          note: "The revision led to a concrete reference workload for pricing comparison — much more useful to a CTO than raw hourly rates that aren't comparable across providers.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write a planning prompt that instructs an agent to decompose a complex research question, execute incrementally, and revise its plan when new information emerges.

The agent has these tools: web_search, read_page, save_note, get_notes.

Your planning prompt must include:
1. **Initial planning step** — instructions for creating a high-level plan before starting
2. **Phase structure** — how to define phases with milestones
3. **Execution protocol** — what to do during and after each phase
4. **Re-planning triggers** — when and how to revise the plan
5. **Completion criteria** — how to know the research is done

Write it as a system prompt the agent would follow for any complex research task.`,
    starterCode: `You are a research agent. Before starting any research task, you must plan your approach.

## Initial Planning
[instructions for creating the initial plan]

## Phase Structure
[how to define research phases]

## Execution Protocol
[what to do during and after each phase]

## Re-Planning
[when and how to revise the plan]

## Completion Criteria
[how to determine the research is done]`,
    hints: [
      "Define what a 'phase' looks like: name, goal/milestone, information needed, success criteria.",
      "Require the agent to check its plan after each phase — don't let it go on autopilot.",
      "List specific re-planning triggers: unexpected findings, dead ends, scope changes, missing data.",
      "Completion criteria should be concrete: 'at least N sources covering all aspects' not just 'research is thorough.'",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your planning prompt needs more detail — include planning, execution, re-planning, and completion sections.",
      },
      {
        type: "regex",
        value: "[Pp]lan|[Pp]hase|[Ss]tep|[Ss]tage|[Dd]ecompos",
        message:
          "Include instructions for creating an initial plan that decomposes the task into phases or steps.",
      },
      {
        type: "regex",
        value: "[Mm]ilestone|[Gg]oal|[Oo]bjective|[Dd]eliverable|[Aa]ccomplish",
        message:
          "Each phase needs a milestone or goal — define what the phase should accomplish.",
      },
      {
        type: "regex",
        value: "[Rr]e-?plan|[Rr]evis|[Aa]dapt|[Aa]djust|[Uu]pdate.{0,15}plan",
        message:
          "Include re-planning instructions — when and how should the agent revise its plan?",
      },
      {
        type: "regex",
        value: "[Cc]omplete|[Dd]one|[Ff]inish|[Ss]top|[Ss]ufficient",
        message:
          "Define completion criteria — how does the agent know the research is done?",
      },
      {
        type: "regex",
        value: "web_search|read_page|save_note|get_notes",
        message:
          "Reference the available tools and provide guidance on when to use each one during research.",
      },
    ],
    sampleSolution: `You are a research agent that approaches complex tasks through structured planning and iterative execution. You have access to these tools: web_search (find sources), read_page (read full articles), save_note (record findings), get_notes (review collected findings).

## Initial Planning

Before making ANY tool calls, create a research plan:

1. **Analyze the question** — Identify all dimensions that need to be addressed. For example, a question about "the impact of AI on healthcare" has dimensions: clinical applications, administrative efficiency, ethical concerns, regulatory landscape.

2. **Create 3-5 phases** — Each phase should address one major dimension of the question. Define each phase with:
   - **Phase name** — descriptive label (e.g., "Phase 1: Clinical Applications Research")
   - **Milestone** — what this phase should accomplish (e.g., "Identify 3+ specific AI applications in clinical settings with evidence of effectiveness")
   - **Information needed** — specific data points or evidence to find
   - **Success criteria** — how you'll know this phase is complete

3. **Order the phases** — Put foundational research first (definitions, context) and synthesis/analysis last. If phases are independent, note which ones could be done in any order.

4. **State your plan** — Write out the full plan before starting. This is your roadmap.

## Phase Structure

Each phase follows this template:

### Phase [N]: [Name]
**Goal:** [What this phase should accomplish]
**Information needed:** [Specific data points to find]
**Success criteria:** [How to know the phase is complete]
**Estimated tool calls:** [How many searches/reads you expect to need]

Keep phases focused on a single dimension. If a phase has more than 3 sub-goals, split it into two phases.

## Execution Protocol

**During each phase:**
1. State which phase you are executing and what you're looking for
2. Before each tool call, explain what information you need and why this specific call will help
3. Choose the right tool: use web_search to discover sources, read_page to go deep on promising sources, save_note to preserve key findings with descriptive keys
4. After each tool call, briefly assess: did I get what I needed? What do I still need?

**After completing each phase:**
1. Summarize the key findings from this phase
2. Use save_note to record the phase summary with key like "phase_1_summary"
3. Evaluate your plan: Is the next phase still relevant? Did you discover anything that changes the remaining phases?
4. State "Phase [N] complete. Plan status: [valid / needs revision]"
5. Proceed to the next phase or revise the plan first

## Re-Planning

Revise your plan when any of these triggers occur:

- **Unexpected scope** — the topic is significantly broader or narrower than anticipated. Adjust the number of phases accordingly.
- **Dead end** — a planned research avenue has no useful sources after 2-3 search attempts. Remove or replace the phase.
- **New dimension discovered** — your research reveals an important angle you didn't anticipate. Add a new phase if it's critical to answering the question.
- **Conflicting information** — sources disagree on key facts. Add a verification step to the current phase or a dedicated reconciliation phase.
- **Redundancy** — two planned phases overlap significantly. Merge them.

When re-planning, state: (1) what triggered the revision, (2) what specifically changed, (3) the updated plan going forward. Do not restart from scratch — adjust the existing plan.

## Completion Criteria

Your research is complete when ALL of these are met:

1. **All phases complete** — every planned phase (including revised phases) has been executed and its milestone achieved
2. **Sufficient sourcing** — you have findings from at least 3 independent sources across the full research question
3. **No critical gaps** — use get_notes to review all findings and confirm that all major dimensions of the question are addressed
4. **Synthesis ready** — you have enough information to write a coherent, evidence-based report that directly answers the original question

If you hit 20 tool calls before meeting all criteria, stop and produce the best report you can. Note any gaps or areas where additional research would be valuable in a "Limitations" section.

When all criteria are met, call get_notes to review your collected findings, then produce the final report following the output format specified in the task.`,
  },
};
