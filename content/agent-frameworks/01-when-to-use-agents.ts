import { Lesson } from "@/lib/types";

export const whenToUseAgents: Lesson = {
  slug: "when-to-use-agents",
  title: "When to Use Agents",
  description:
    "Understand the spectrum from single-turn prompts to autonomous agents and when each pattern fits.",
  order: 1,
  content: {
    explanation: `LLM-powered applications exist on a spectrum of complexity, and choosing the right level for your task is one of the most important architectural decisions you'll make. Adding agent capabilities when they're not needed introduces latency, cost, and failure modes for no benefit.

**Level 1: Direct Prompts** — A single request-response cycle. The user sends a message, the model responds, and the interaction is complete. This covers classification, summarization, extraction, and simple generation. If the task can be fully specified in one prompt and the model has all the information it needs, a direct prompt is the right choice.

**Level 2: Prompt Chains** — A fixed sequence of LLM calls where the output of one step feeds into the next. For example: extract key entities from a document, then generate a summary focusing on those entities, then translate the summary. Each step is predictable and the sequence is determined at design time, not runtime. Use prompt chains when the task has multiple stages but the steps are known in advance.

**Level 3: Tool Use (Single Turn)** — The model can call external tools (APIs, databases, calculators) to gather information or take actions. This still involves a round-trip — the model proposes tool calls, the runtime executes them, the results are sent back, and the model produces a final response — but the key distinction from an agent loop is that it resolves in a single planning step rather than iterating. This is appropriate when the model needs external data but the task doesn't require multi-step reasoning where later actions depend on earlier results.

**Level 4: Agent Loops** — The model operates in a loop: observe the current state, reason about what to do next, take an action (often a tool call), observe the result, and repeat until the task is complete or a stop condition is met. Agents can handle open-ended tasks where the number of steps isn't known in advance, where intermediate results change the plan, and where complex reasoning spans multiple tool interactions.

**The Decision Framework:**
- Does the task require **multiple dynamic steps** where later steps depend on earlier results? If no, use a direct prompt or chain.
- Does the task require **external data or actions** (API calls, database queries, file operations)? If no, use a direct prompt.
- Is the number of steps **unpredictable**? If yes, you need an agent loop. If the steps are fixed, use a prompt chain.
- Does the task require **iterative refinement** based on intermediate feedback? If yes, an agent is appropriate.

A common mistake is building a full agent for a task that could be solved with a single prompt. Agents typically add 3-10x latency, increase token costs due to repeated context, and introduce new failure modes (infinite loops, tool errors, planning mistakes). Start with the simplest pattern that works and only escalate when you hit a genuine limitation.`,
    whyItMatters:
      "Choosing the wrong complexity level is expensive in both directions. Under-building means your system can't handle the task. Over-building means unnecessary latency, cost, and failure modes. As a practitioner, knowing exactly when to reach for an agent versus a simpler pattern saves weeks of development and produces more reliable systems.",
    keyPrinciples: [
      "Start with the simplest pattern that solves the task — direct prompt first, then chain, then tool use, then agent loop",
      "Use agents only when the number of steps is dynamic and later steps depend on the results of earlier ones",
      "Agents typically add 3-10x latency and cost over direct prompts, so the task complexity must justify the overhead",
      "If the sequence of steps is known at design time, a prompt chain is more reliable than an agent loop",
    ],
  },
  example: {
    scenario:
      "A team is deciding whether to build an agent for classifying customer support tickets into categories.",
    bad: {
      systemPrompt: `You are an intelligent agent with access to the following tools:
- classify_ticket(text, categories) — classifies a support ticket
- get_ticket_history(customer_id) — retrieves past tickets
- route_ticket(ticket_id, department) — routes ticket to a department
- update_crm(customer_id, data) — updates CRM record
- send_notification(recipient, message) — sends a notification

For each incoming ticket, analyze it thoroughly using all available tools. First retrieve history, then classify, then route, then update the CRM, then notify the team.`,
      userMessage: `Classify this support ticket:

"I can't log in to my account. I've tried resetting my password three times and it still doesn't work."

Categories: billing, technical, account, feature-request`,
      assistantResponse: `Let me analyze this ticket step by step.

Step 1: I'll classify this ticket first.
[Calling classify_ticket("I can't log in...", ["billing", "technical", "account", "feature-request"])]
Result: account

Step 2: Let me retrieve the customer's history.
[Calling get_ticket_history(customer_12345)]
Result: 2 previous tickets about login issues

Step 3: Routing to account department.
[Calling route_ticket(ticket_789, "account")]
Result: Routed successfully

Step 4: Updating CRM...
[Calling update_crm(customer_12345, {category: "account", recurring: true})]
Result: Updated

Step 5: Sending notification...
[Calling send_notification("account-team", "New recurring login issue")]
Result: Sent

Final classification: **account**`,
      annotations: [
        {
          text: "You are an intelligent agent with access to the following tools",
          note: "This is massive overkill. The task is classification — one LLM call with no tools needed. The agent framework adds 5 tool calls, 10x latency, and multiple failure points for a task that needs one.",
        },
        {
          text: "analyze it thoroughly using all available tools",
          note: "Instructing the agent to use ALL tools on every ticket guarantees unnecessary work. Most tickets just need a category label, not CRM updates and notifications.",
        },
        {
          text: "Let me analyze this ticket step by step",
          note: "Five sequential tool calls for a simple classification. Each call adds latency and can fail. The actual classification happened in Step 1 — everything else is busywork.",
        },
      ],
    },
    good: {
      userMessage: `For each use case below, recommend the appropriate LLM pattern and justify your choice.

**Use Case A: Ticket Classification**
Assign a category to incoming support tickets from: billing, technical, account, feature-request.

**Use Case B: Research Report Generation**
Given a topic, search multiple sources, synthesize findings, verify claims, and produce a structured report.

**Use Case C: Document Translation Pipeline**
Translate a document from English to Spanish, then have a second pass check for cultural idioms.

**Use Case D: Customer Account Troubleshooting**
Help a customer diagnose why their integration isn't working by checking their config, API logs, and suggesting fixes.

**Use Case E: Daily Metrics Summary**
Pull data from three dashboards and generate a morning summary email.`,
      assistantResponse: `**Use Case A: Ticket Classification → Direct Prompt**
Single LLM call with the ticket text and category list. No tools needed, no iteration required. The model has all information in the prompt. Adding an agent loop here would be pure overhead.

**Use Case B: Research Report → Agent Loop**
This requires dynamic planning: search for sources, evaluate relevance, follow up on promising leads, cross-reference claims, and restructure findings. The number of searches depends on what's found. An agent can plan its research, execute searches, assess gaps, and iterate until the report meets quality criteria.

**Use Case C: Document Translation → Prompt Chain**
Two fixed steps: (1) translate the document, (2) review and fix cultural idioms. The sequence is known at design time and doesn't change based on content. A chain is simpler and more reliable than an agent here.

**Use Case D: Account Troubleshooting → Agent Loop**
The agent needs to check config (tool call), examine logs (tool call), form a hypothesis, test it with additional checks, and suggest fixes. Each step depends on what the previous step revealed. The number of diagnostic steps is unpredictable — a simple issue might take 2 checks, a complex one might take 8.

**Use Case E: Metrics Summary → Prompt Chain (with tools)**
Three data pulls (fixed and known), then one generation step. The tools are needed but the sequence is deterministic: pull dashboard A, pull dashboard B, pull dashboard C, generate summary. No dynamic planning required — a chain with tool calls handles this cleanly.`,
      annotations: [
        {
          text: "Direct Prompt",
          note: "Classification is a single-step task with all information present. Recognizing this avoids building unnecessary infrastructure.",
        },
        {
          text: "Agent Loop",
          note: "Research has unpredictable steps — each finding changes the next search. This is the right use of an agent: dynamic planning based on intermediate results.",
        },
        {
          text: "Prompt Chain",
          note: "Translation review is a fixed two-step pipeline. Using a chain instead of an agent is simpler, faster, and eliminates the risk of infinite loops.",
        },
        {
          text: "Prompt Chain (with tools)",
          note: "Tool use doesn't automatically mean 'agent.' When the tool calls are predetermined, a chain with tools is the right pattern.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Given 5 use case descriptions, classify each as "direct prompt," "prompt chain," or "agent" and provide a clear justification.

For each use case:
1. State the pattern: direct prompt, prompt chain, or agent
2. Explain why this pattern fits (2-3 sentences)
3. Explain why the other patterns would be a poor fit

**Use cases to classify:**
1. Summarize a legal contract into 5 bullet points
2. Monitor a deployed service — check health endpoints, investigate alerts, and restart services if needed
3. Extract structured data from a resume, then score the candidate against job requirements
4. Moderate user-generated content for policy violations
5. Plan and book a multi-leg travel itinerary based on user preferences and real-time availability`,
    starterCode: `## Use Case Classification

### 1. Summarize a legal contract
**Pattern:** [direct prompt / prompt chain / agent]
**Justification:** [why this pattern fits]
**Why not the others:** [why alternatives are wrong]

### 2. Monitor a deployed service
**Pattern:** [direct prompt / prompt chain / agent]
**Justification:** [why this pattern fits]
**Why not the others:** [why alternatives are wrong]

### 3. Extract and score resume data
**Pattern:** [direct prompt / prompt chain / agent]
**Justification:** [why this pattern fits]
**Why not the others:** [why alternatives are wrong]

### 4. Moderate user-generated content
**Pattern:** [direct prompt / prompt chain / agent]
**Justification:** [why this pattern fits]
**Why not the others:** [why alternatives are wrong]

### 5. Plan and book travel itinerary
**Pattern:** [direct prompt / prompt chain / agent]
**Justification:** [why this pattern fits]
**Why not the others:** [why alternatives are wrong]`,
    hints: [
      "Consider whether the task can be completed in a single LLM call with no external data needed.",
      "Ask yourself: is the sequence of steps known at design time, or does it depend on intermediate results?",
      "Tool use alone doesn't make something an agent — if the tool calls are predetermined, it's still a chain.",
      "Think about whether the task requires iterative reasoning where the next step depends on what happened before.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your classifications need more detail — include justification and reasoning for each use case.",
      },
      {
        type: "regex",
        value: "[Dd]irect [Pp]rompt",
        message:
          "At least one use case should be classified as a direct prompt — identify which tasks need only a single LLM call.",
      },
      {
        type: "regex",
        value: "[Pp]rompt [Cc]hain",
        message:
          "At least one use case should be classified as a prompt chain — identify which tasks have fixed multi-step sequences.",
      },
      {
        type: "regex",
        value: "[Aa]gent",
        message:
          "At least one use case should be classified as an agent — identify which tasks require dynamic multi-step reasoning.",
      },
      {
        type: "regex",
        value: "[Jj]ustif|[Bb]ecause|[Rr]eason|[Ww]hy|fits|appropriate",
        message:
          "Provide justification for each classification — explain why the chosen pattern is the best fit.",
      },
      {
        type: "has-section",
        value: "### 5",
        message:
          "Make sure you classify all 5 use cases — each should have its own section.",
      },
    ],
    sampleSolution: `## Use Case Classification

### 1. Summarize a legal contract
**Pattern:** Direct prompt
**Justification:** The entire contract text can be provided in the prompt, and the model needs to produce a summary in one pass. There are no external data sources needed and no dynamic steps — the model reads the input and generates bullet points. This is a single-turn text-to-text task.
**Why not the others:** A prompt chain adds unnecessary complexity since there's only one step. An agent is overkill because there are no tools to call, no iteration needed, and the task is fully specified in the input.

### 2. Monitor a deployed service
**Pattern:** Agent
**Justification:** This task requires an ongoing loop: check health endpoints (tool call), interpret results, decide whether investigation is needed, examine logs (tool call), diagnose the issue, and potentially restart services (tool call). The number and type of steps depends entirely on what the agent discovers at each stage — a healthy service needs one check, while a failing service might need 10 diagnostic steps.
**Why not the others:** A direct prompt can't interact with live services. A prompt chain won't work because the sequence of diagnostic steps is unpredictable and changes based on what each health check reveals.

### 3. Extract and score resume data
**Pattern:** Prompt chain
**Justification:** This is a fixed two-step pipeline: Step 1 extracts structured data (name, skills, experience) from the resume text. Step 2 takes that structured data and scores it against job requirements. The sequence is known at design time and doesn't change. Each step's output feeds directly into the next.
**Why not the others:** A direct prompt could technically do both, but separating extraction from scoring produces more reliable results and allows independent testing. An agent is inappropriate because there's no dynamic decision-making — the two steps are always the same regardless of the resume content.

### 4. Moderate user-generated content
**Pattern:** Direct prompt
**Justification:** Content moderation is fundamentally a classification task. The model receives the content and the policy rules, then determines whether the content violates any policies. All information is available in the prompt, the output is a structured decision (approve/flag/reject with reasons), and no external tools or iteration are needed.
**Why not the others:** A prompt chain isn't needed because moderation is a single evaluation step, not a multi-stage pipeline. An agent adds unnecessary latency and complexity to what should be a fast, high-throughput classification operation.

### 5. Plan and book travel itinerary
**Pattern:** Agent
**Justification:** Travel planning requires searching for flights (tool call), comparing options, checking hotel availability (tool call) near the chosen flights, adjusting plans when preferred options are unavailable, and booking (tool call) once the itinerary fits the user's preferences. The plan must adapt dynamically — if the desired flight is sold out, the agent needs to find alternatives and adjust the rest of the itinerary accordingly.
**Why not the others:** A direct prompt can't access real-time availability data. A prompt chain won't work because the steps aren't fixed — if a flight is unavailable, the agent needs to re-plan subsequent legs, search for alternatives, and potentially change hotels. The dynamic, iterative nature of travel planning makes it a natural fit for an agent loop.`,
  },
};
