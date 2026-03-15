import { Lesson } from "@/lib/types";

export const agentLoop: Lesson = {
  slug: "agent-loop",
  title: "The Agent Loop",
  description:
    "Master the observe-think-act cycle, purposeful tool calls, and well-defined stop conditions.",
  order: 3,
  content: {
    explanation: `The agent loop is the core execution pattern for any LLM agent. Unlike a simple prompt-response, an agent operates in a cycle: **observe** the current state, **think** about what to do next, **act** by calling a tool or producing output, then repeat. Understanding this loop — and designing it well — is what separates a functional agent from one that spins endlessly or gives up too soon.

**The Observe-Think-Act Cycle**

Each iteration of the loop follows three phases:

1. **Observe** — The agent takes in the current state: the user's original request, the results of any previous tool calls, any errors encountered, and the conversation history. This is the agent's "working memory."

2. **Think** — The agent reasons about the current state. What progress has been made? What's still needed? Which tool should be called next? Should the task be considered complete? This reasoning step — often visible as "chain of thought" in the response — is where planning happens.

3. **Act** — The agent either calls a tool (to gather information or take an action) or produces a final response (if the task is complete). After a tool call, the loop returns to Observe with the new tool result.

**The System Prompt's Role**

The system prompt is the agent's instruction manual. It must define:
- **Available tools** — what tools exist and what they do
- **Decision-making criteria** — how to choose between tools, when to ask for clarification vs. proceeding
- **Output format** — how to structure the final response
- **Behavioral guidelines** — constraints on what the agent should and shouldn't do

**Stop Conditions Are Critical**

An agent without clear stop conditions will either loop forever or stop prematurely. Every agent needs explicit stop conditions:

- **Task complete** — the agent has gathered all needed information and produced the required output. Define what "complete" means concretely: "you have answered all parts of the user's question with supporting evidence."
- **Maximum iterations** — a hard cap on loop iterations (e.g., 10 tool calls). This prevents runaway loops and controls costs. When the cap is hit, the agent should summarize what it accomplished and what remains.
- **Confidence threshold** — the agent stops when it has sufficient confidence in its answer. Useful for research tasks: "stop when you have found at least 3 independent sources confirming the claim."
- **Error threshold** — too many consecutive failures indicate a fundamental problem. After N failed tool calls, the agent should escalate or report the issue rather than retrying forever.
- **User escalation** — some tasks should be handed back to the user when the agent can't resolve them autonomously. Define when this happens: "if the customer's issue requires database access you don't have, escalate to a human agent."

**Common Pitfalls**

The most dangerous pattern is an agent that calls tools without purpose — making API calls "just in case" or re-fetching data it already has. Every tool call should have a clear reason tied to the current task. If the agent can't articulate why it's calling a tool, it shouldn't call it.`,
    whyItMatters:
      "The agent loop is the runtime behavior of every LLM agent. If the loop is poorly designed — unclear reasoning, no stop conditions, purposeless tool calls — the agent will be unreliable, expensive, and frustrating to debug. A well-designed loop produces predictable, auditable behavior where every action has a clear reason.",
    keyPrinciples: [
      "Every iteration must follow observe-think-act: take in state, reason about next steps, then act with purpose",
      "The system prompt must define available tools, decision criteria, output format, and behavioral constraints",
      "Always define explicit stop conditions: task complete, max iterations, confidence threshold, and error limits",
      "Every tool call should have a stated reason — if the agent can't explain why it's calling a tool, it shouldn't",
    ],
  },
  example: {
    scenario:
      "A research agent is tasked with finding the current market cap and recent performance of a specific company's stock.",
    bad: {
      systemPrompt: `You are a helpful research agent. You have access to these tools:
- web_search(query: string) — search the web
- get_stock_data(ticker: string) — get stock information
- get_news(query: string) — get recent news

Answer the user's question.`,
      userMessage:
        "What is the current market cap and recent performance of Tesla?",
      assistantResponse: `I'll help you find that information.

[Calling web_search("Tesla")]
Result: Tesla, Inc. is an American electric vehicle and clean energy company...

[Calling web_search("Tesla stock price")]
Result: TSLA is currently trading at $178.23...

[Calling get_stock_data("TSLA")]
Result: { price: 178.23, market_cap: "566B", change_1d: -2.1%, change_1m: +8.4% }

[Calling get_news("Tesla")]
Result: "Tesla Q4 deliveries beat expectations..." "Elon Musk announces new factory..."

[Calling web_search("Tesla market cap 2024")]
Result: Tesla's market cap is approximately $566 billion...

[Calling get_news("Tesla stock performance")]
Result: "Tesla stock has risen 8.4% in the past month..."

[Calling web_search("Tesla competitors market cap")]
Result: ...

Tesla's market cap is $566 billion and the stock is up 8.4% in the past month.`,
      annotations: [
        {
          text: "Answer the user's question.",
          note: "No stop conditions, no reasoning instructions, no output format. The agent has no guidance on when it has enough information to stop.",
        },
        {
          text: "[Calling web_search(\"Tesla\")]",
          note: "This generic search adds no value — the agent should start with the specific tool (get_stock_data) that directly answers the question.",
        },
        {
          text: "[Calling web_search(\"Tesla market cap 2024\")]",
          note: "Redundant call — the agent already has the market cap from get_stock_data. Without reasoning between calls, it re-fetches data it already has.",
        },
        {
          text: "[Calling web_search(\"Tesla competitors market cap\")]",
          note: "Scope creep — the user didn't ask about competitors. Without clear stop conditions, the agent keeps searching beyond the original question.",
        },
      ],
    },
    good: {
      systemPrompt: `You are a financial research agent. You have access to these tools:
- web_search(query: string) — search the web for general information
- get_stock_data(ticker: string) — get real-time stock data including price, market cap, and performance metrics
- get_news(query: string) — get recent news articles

## Decision-Making Instructions
1. Before each tool call, state what information you still need and why this tool call will help.
2. Use the most specific tool first — prefer get_stock_data over web_search for financial data.
3. Do not make redundant calls — if you already have the information, move to the next need or finish.

## Stop Conditions
- Stop when you have answered ALL parts of the user's question with data from reliable sources.
- Maximum 5 tool calls. If you reach the limit, summarize what you found and note any gaps.
- If a tool fails, try once with a modified query. If it fails again, note the gap and continue.

## Output Format
Present findings in a structured summary with: key metrics, recent performance, and sources.`,
      userMessage:
        "What is the current market cap and recent performance of Tesla?",
      assistantResponse: `I need two pieces of information: (1) Tesla's current market cap and (2) recent stock performance. The get_stock_data tool should provide both directly.

[Calling get_stock_data("TSLA")]
Result: { price: 178.23, market_cap: "566B", change_1d: -2.1%, change_1w: +3.7%, change_1m: +8.4%, change_ytd: -14.2% }

I now have market cap and performance data. Let me get recent news for context on the performance trends.

[Calling get_news("Tesla stock performance")]
Result: [{ title: "Tesla Q4 deliveries beat expectations, stock rises 8%", date: "2024-03-10" }, { title: "Analysts upgrade Tesla on strong demand outlook", date: "2024-03-08" }]

I have all the information needed to answer both parts of the question. Stopping here.

## Tesla (TSLA) — Summary

**Current Market Cap:** $566 billion

**Recent Performance:**
- Today: -2.1%
- Past week: +3.7%
- Past month: +8.4%
- Year-to-date: -14.2%

**Context:** The recent monthly gains appear driven by better-than-expected Q4 delivery numbers and analyst upgrades on a strong demand outlook. Despite the positive month, the stock is still down 14.2% year-to-date.

*Data from get_stock_data and news search. 2 of 5 tool calls used.*`,
      annotations: [
        {
          text: "I need two pieces of information",
          note: "The agent starts by stating what it needs and why. This observe-think step ensures purposeful tool use.",
        },
        {
          text: "get_stock_data tool should provide both directly",
          note: "The agent picks the most specific tool first, following the decision-making instructions. One targeted call instead of a generic web search.",
        },
        {
          text: "I have all the information needed to answer both parts",
          note: "Explicit reasoning about the stop condition — the agent confirms it has answered all parts of the question before stopping.",
        },
        {
          text: "2 of 5 tool calls used",
          note: "The agent tracked its tool call budget and stopped efficiently. Clear stop conditions prevented unnecessary extra calls.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write a system prompt for a research agent that has access to the following tools:

- \`web_search(query: string)\` — searches the web, returns top 5 results with snippets
- \`read_page(url: string)\` — fetches and reads the full content of a web page
- \`save_note(key: string, content: string)\` — saves a note for later reference
- \`get_notes()\` — retrieves all saved notes

The agent's job is to research a topic and produce a structured report. Your system prompt must include:

1. **Role and available tools** — describe each tool clearly
2. **Decision-making instructions** — how to choose which tool to call and when
3. **Reasoning requirements** — the agent must think before each action
4. **Output format** — how to structure the final report
5. **Stop conditions** — at least 3 explicit conditions for when to stop the loop`,
    starterCode: `You are a research agent tasked with investigating topics and producing structured reports.

## Available Tools
[describe each tool and when to use it]

## Decision-Making Instructions
[how to choose between tools]

## Reasoning Requirements
[require the agent to think before acting]

## Output Format
[structure for the final report]

## Stop Conditions
[when to stop the research loop]`,
    hints: [
      "Be specific about tool ordering: search first to find relevant sources, then read the most promising pages, then save key findings.",
      "Require the agent to state its reasoning before each tool call — this prevents purposeless calls.",
      "Define 'done' concretely: e.g., 'you have found information from at least 3 sources that addresses all aspects of the research question.'",
      "Include a maximum iteration count and instructions for what to do when the limit is reached.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your system prompt needs more detail — include tool descriptions, decision criteria, reasoning requirements, output format, and stop conditions.",
      },
      {
        type: "regex",
        value: "web_search|read_page|save_note|get_notes",
        message:
          "Reference the available tools by name and describe when to use each one.",
      },
      {
        type: "regex",
        value: "[Bb]efore.{0,30}(tool|call|action)|[Rr]eason|[Tt]hink|[Ee]xplain.{0,20}why",
        message:
          "Require the agent to reason before each tool call — this is essential for purposeful behavior.",
      },
      {
        type: "regex",
        value: "[Ss]top|[Cc]omplete|[Ff]inish|[Dd]one|[Tt]erminate|[Mm]ax.{0,15}(iter|call|step)",
        message:
          "Define explicit stop conditions — when should the agent stop the research loop?",
      },
      {
        type: "regex",
        value: "[Oo]utput|[Ff]ormat|[Rr]eport|[Ss]tructur|[Ss]ection|[Ss]ummar",
        message:
          "Specify the output format — how should the agent structure its final report?",
      },
      {
        type: "regex",
        value: "[Dd]ecid|[Cc]hoose|[Ss]elect|[Ww]hich tool|[Pp]refer|[Pp]rioritize",
        message:
          "Include decision-making instructions — how should the agent decide which tool to use next?",
      },
    ],
    sampleSolution: `You are a research agent tasked with investigating topics and producing structured reports. You work in an observe-think-act loop: review your current state, reason about what to do next, then take a single action.

## Available Tools

1. **web_search(query: string)** — Searches the web and returns the top 5 results with titles, URLs, and text snippets. Use this as your starting point to find relevant sources. Use specific, targeted queries rather than broad terms. You may call this multiple times with different queries to explore different angles of the topic.

2. **read_page(url: string)** — Fetches the full content of a web page. Use this to read the complete text of promising results from web_search. Only read pages whose snippets suggest they contain relevant, detailed information. Do not read pages that are clearly irrelevant or that duplicate information you already have.

3. **save_note(key: string, content: string)** — Saves a note with a descriptive key for later reference. Use this to record key findings, quotes, and data points as you research. Save notes immediately after finding important information — do not wait until the end. Use descriptive keys like "market_size_2024" or "expert_opinion_smith".

4. **get_notes()** — Retrieves all saved notes. Use this before writing your final report to review everything you've collected. Also useful mid-research to check what gaps remain.

## Decision-Making Instructions

Before each action, decide which tool to use based on your current research state:

- **Starting out?** Use web_search to find initial sources. Choose 2-3 different search queries that cover different aspects of the topic.
- **Found promising results?** Use read_page on the most relevant URLs. Prioritize primary sources, official reports, and expert analyses over opinion pieces or summaries.
- **Found important information?** Use save_note to record it immediately with a descriptive key before continuing.
- **Unsure what's missing?** Use get_notes to review your collected findings and identify gaps.
- **Ready to write?** Stop and produce the report when you meet the stop conditions below.

Prefer specific tools over general ones. Do not use web_search for information you can get from read_page on a known URL. Do not re-read pages you have already read. Do not save duplicate notes.

## Reasoning Requirements

Before every tool call, you MUST state:
1. What information you currently have
2. What information you still need
3. Why this specific tool call will help fill the gap
4. Which specific query or URL you will use and why you chose it

If you cannot clearly explain why a tool call is necessary, do not make it. Every action must be purposeful and move the research forward.

## Output Format

When your research is complete, produce a report with this structure:

### Research Report: [Topic]

**Summary** — 2-3 sentence overview of key findings

**Key Findings**
- Finding 1 with supporting evidence and source
- Finding 2 with supporting evidence and source
- Finding 3 with supporting evidence and source

**Analysis** — What the findings mean, any patterns, contradictions, or notable insights

**Sources** — List all sources referenced with URLs

**Confidence Level** — High/Medium/Low with explanation of any gaps or limitations

## Stop Conditions

Stop the research loop and produce your final report when ANY of these conditions is met:

1. **Sufficient coverage** — You have found information from at least 3 independent sources that addresses all major aspects of the research question. Use get_notes to verify coverage before stopping.
2. **Maximum tool calls** — You have made 15 tool calls. Summarize what you found and clearly note any remaining gaps in your Confidence Level section.
3. **Diminishing returns** — Two consecutive web searches return no new relevant information that you haven't already captured in notes. This means you've likely exhausted available sources.
4. **Critical failure** — A tool fails twice in a row on the same operation. Note the failure in your report and work with the information you have.

When you stop, always call get_notes first to review all collected findings before writing the report.`,
  },
};
