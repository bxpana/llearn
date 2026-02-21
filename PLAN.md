# LLearn — Remaining Module Plans

Three modules remain to be built. Each follows the same pattern as the completed modules (Prompt Engineering, Evaluation Frameworks): lesson files in `content/<module-slug>/`, a module index, and one import update in `lib/content.ts`. No changes to types, components, validation, or routing needed.

See any completed lesson file (e.g., `content/evaluation-frameworks/01-what-are-evals.ts`) for the exact structure.

---

## Module 3: Agent Frameworks (`agent-frameworks`)

Design tool-using agents with planning loops and orchestration. Relevant to the SA role because customers building agents need guidance on when agentic patterns are appropriate, how to design tool interfaces, and how to handle failures gracefully.

### Lessons

#### 1. When to Use Agents (`when-to-use-agents`)
- **Teaches:** The spectrum from single-turn prompts to fully autonomous agents. When agentic patterns add value vs. when they add unnecessary complexity. Decision framework: does the task require multiple steps, tool use, or dynamic planning?
- **Example:** Bad — building an agent for a simple classification task. Good — decision tree showing when to use direct prompting, chain-of-thought, tool use, or a full agent loop.
- **Exercise:** Given 5 use case descriptions, classify each as "direct prompt," "prompt chain," or "agent" and justify the choice.

#### 2. Tool Design for Agents (`tool-design`)
- **Teaches:** How to define tools that LLMs can use effectively. Clear tool names, descriptions, and parameter schemas. The principle of least privilege. Keeping tools atomic and composable.
- **Example:** Bad — a single "do_everything" tool with 15 optional parameters. Good — 4 focused tools (search, lookup, calculate, format) with clear descriptions and typed parameters.
- **Exercise:** Design a tool interface (name, description, parameters, return type) for 3 tools that a customer service agent would use (e.g., lookup order, check refund eligibility, initiate refund).

#### 3. The Agent Loop (`agent-loop`)
- **Teaches:** The observe-think-act cycle. How agents decide which tool to call next. Stop conditions (task complete, max iterations, confidence threshold). The system prompt's role in guiding agent behavior.
- **Example:** Bad — agent with no stop condition that loops forever. Good — agent loop with clear reasoning at each step, tool calls with purpose, and a well-defined completion condition.
- **Exercise:** Write a system prompt for an agent that researches a topic, including: available tools, decision-making instructions, output format, and stop conditions.

#### 4. Planning and Decomposition (`planning-decomposition`)
- **Teaches:** How agents break complex tasks into subtasks. Upfront planning vs. incremental planning. When to re-plan after new information. The tradeoff between plan detail and flexibility.
- **Example:** Bad — agent attempts a 10-step research task in one shot. Good — agent creates a 3-step plan, executes step 1, revises the plan based on findings, continues.
- **Exercise:** Given a complex research question, write a planning prompt that instructs the agent to decompose the task, execute incrementally, and revise its plan after each step.

#### 5. Error Handling and Recovery (`error-handling`)
- **Teaches:** What happens when a tool call fails, returns unexpected data, or times out. Retry strategies. Graceful degradation. When to ask the user for help vs. when to recover autonomously.
- **Example:** Bad — agent crashes on first API error. Good — agent with fallback strategies: retry with backoff, try alternative tool, degrade gracefully, escalate to user.
- **Exercise:** Write error handling instructions for an agent system prompt that covers: tool failures, ambiguous results, rate limits, and tasks the agent can't complete.

#### 6. Multi-Agent Orchestration (`multi-agent`)
- **Teaches:** When to use multiple specialized agents vs. one general agent. Orchestrator patterns (router, supervisor, pipeline). Passing context between agents. Managing shared state.
- **Example:** Bad — one mega-agent that handles support, billing, and technical questions with a 5000-token system prompt. Good — router agent that classifies intent and delegates to specialized agents, each with focused system prompts.
- **Exercise:** Design a multi-agent architecture for an e-commerce assistant with a router and 3 specialized agents. Define each agent's scope, the routing logic, and how context is passed between them.

### Files to Create
1. `content/agent-frameworks/01-when-to-use-agents.ts`
2. `content/agent-frameworks/02-tool-design.ts`
3. `content/agent-frameworks/03-agent-loop.ts`
4. `content/agent-frameworks/04-planning-decomposition.ts`
5. `content/agent-frameworks/05-error-handling.ts`
6. `content/agent-frameworks/06-multi-agent.ts`
7. `content/agent-frameworks/index.ts`

### File to Modify
- `lib/content.ts` — import `agentFrameworksModule`, replace `comingSoon` placeholder.

---

## Module 4: Retrieval (RAG) (`retrieval-frameworks`)

Implement retrieval-augmented generation with chunking, embeddings, and search. Relevant to SA work because RAG is the most common architecture customers ask about, and getting it right requires understanding the full pipeline from document ingestion to answer generation.

### Lessons

#### 1. Why RAG (`why-rag`)
- **Teaches:** The problem RAG solves — LLMs don't know your private data. Alternatives (fine-tuning, long context) and when RAG is the right choice. The basic RAG pipeline: retrieve → augment → generate.
- **Example:** Bad — asking an LLM about internal company policies (it hallucinates). Good — retrieving relevant policy documents and including them in context before generating an answer.
- **Exercise:** Given a use case (internal knowledge base Q&A), explain why RAG is more appropriate than fine-tuning or long-context, and sketch the pipeline components.

#### 2. Chunking Strategies (`chunking-strategies`)
- **Teaches:** Why documents must be chunked. Fixed-size vs. semantic vs. structural chunking. Chunk size tradeoffs (too small = missing context, too large = diluted relevance). Overlap and metadata preservation.
- **Example:** Bad — splitting a legal contract at every 500 characters (breaks mid-sentence, loses section context). Good — chunking by section with overlap, preserving section headers as metadata.
- **Exercise:** Given a sample document structure (e.g., an employee handbook with sections and subsections), design a chunking strategy specifying: method, chunk size, overlap, and what metadata to preserve.

#### 3. Embeddings and Vector Search (`embeddings-search`)
- **Teaches:** What embeddings are (text → vector). Semantic similarity vs. keyword matching. Embedding model selection. Vector databases and similarity metrics (cosine, dot product). The indexing pipeline.
- **Example:** Bad — keyword search for "PTO policy" misses a chunk titled "Time Off Guidelines." Good — embedding search finds semantically similar chunks regardless of exact wording.
- **Exercise:** Given 5 user queries and 5 document chunks, predict which chunks would rank highest for each query using semantic similarity reasoning, and identify one query where keyword search would fail but embedding search would succeed.

#### 4. Retrieval Quality (`retrieval-quality`)
- **Teaches:** Precision vs. recall in retrieval. Top-k selection. Re-ranking retrieved chunks. Hybrid search (combining keyword and semantic). Evaluating retrieval quality independently from generation quality.
- **Example:** Bad — retrieving top-20 chunks and stuffing them all into context (noisy, expensive). Good — retrieving top-10, re-ranking by relevance, selecting top-3 for the prompt.
- **Exercise:** Design a retrieval evaluation: given a set of queries with known relevant documents, define metrics (precision@k, recall@k) and pass criteria for a retrieval system.

#### 5. Prompt Design for RAG (`rag-prompt-design`)
- **Teaches:** How to structure the generation prompt with retrieved context. Citation and attribution. Handling contradictory sources. Instructing the model to say "I don't know" when context is insufficient. Separating retrieved content from instructions.
- **Example:** Bad — dumping 5 chunks into the prompt with no structure. Good — XML-tagged context blocks with source labels, explicit instructions to cite sources and flag gaps.
- **Exercise:** Write a RAG generation prompt for a customer support bot that: includes retrieved context with source tags, instructs the model to cite sources, and handles the case where no relevant context was found.

#### 6. RAG Pipeline Evaluation (`rag-evaluation`)
- **Teaches:** End-to-end RAG evaluation. Evaluating retrieval and generation separately. Faithfulness (does the answer match the sources?), relevance (does the answer address the question?), completeness (are all relevant points covered?). Common failure modes.
- **Example:** Bad — evaluating only the final answer quality (can't tell if failures are retrieval or generation). Good — separate retrieval eval (did we find the right chunks?) and generation eval (did we use them correctly?).
- **Exercise:** Design an end-to-end eval plan for a RAG-based HR policy bot, with separate retrieval and generation metrics, test cases, and pass criteria.

### Files to Create
1. `content/retrieval-frameworks/01-why-rag.ts`
2. `content/retrieval-frameworks/02-chunking-strategies.ts`
3. `content/retrieval-frameworks/03-embeddings-search.ts`
4. `content/retrieval-frameworks/04-retrieval-quality.ts`
5. `content/retrieval-frameworks/05-rag-prompt-design.ts`
6. `content/retrieval-frameworks/06-rag-evaluation.ts`
7. `content/retrieval-frameworks/index.ts`

### File to Modify
- `lib/content.ts` — import `retrievalFrameworksModule`, replace `comingSoon` placeholder.

---

## Module 5: LLM Implementation Patterns (`implementation-patterns`)

Streaming, tool use, multi-turn conversations, error handling, and token management. This module covers the practical engineering patterns needed to build production LLM applications, relevant to SA work because these are the integration challenges customers face daily.

### Lessons

#### 1. Streaming Responses (`streaming`)
- **Teaches:** Why streaming matters for UX (time-to-first-token). Server-sent events (SSE). Handling partial JSON in streamed responses. When to stream vs. when to wait for the full response. Client-side rendering of streaming text.
- **Example:** Bad — user waits 8 seconds for a complete response with no feedback. Good — streamed response that starts appearing in 200ms, with a well-designed prompt that front-loads the most useful information.
- **Exercise:** Design a streaming implementation plan for a chatbot: specify when to stream vs. buffer, how to handle structured output mid-stream, and how to show progress for tool calls.

#### 2. Tool Use / Function Calling (`tool-use`)
- **Teaches:** How tool use works (model generates structured tool calls, your code executes them, results go back to the model). Defining tool schemas. Parallel vs. sequential tool calls. Validating tool call arguments before execution.
- **Example:** Bad — tool schema with vague description and untyped parameters. Good — well-defined tool with clear description, typed parameters with constraints, and example usage.
- **Exercise:** Define 3 tool schemas for a travel booking assistant (search flights, check availability, book ticket) with complete descriptions, parameter types, and validation rules.

#### 3. Multi-Turn Conversation Design (`multi-turn`)
- **Teaches:** Managing conversation history. Context window limits and truncation strategies. System prompt stability across turns. Summarizing prior context. When to reset vs. continue a conversation.
- **Example:** Bad — appending all messages forever until hitting the context limit and crashing. Good — sliding window with summarization of older messages, pinned system prompt, and graceful handling when approaching limits.
- **Exercise:** Design a conversation management strategy for a customer support bot with a 100k token context window, specifying: what to keep, what to summarize, when to summarize, and how to handle the system prompt.

#### 4. Error Handling and Retries (`error-handling-retries`)
- **Teaches:** Common API errors (rate limits, timeouts, overloaded, invalid requests). Retry strategies with exponential backoff. Circuit breaker patterns. Fallback responses. Logging and monitoring for production.
- **Example:** Bad — catching all errors with a generic "something went wrong." Good — specific handling for each error type: retry on rate limit with backoff, fallback response on timeout, alert on repeated failures.
- **Exercise:** Write an error handling specification for a production LLM integration covering: rate limits (429), server errors (500/503), timeouts, invalid responses, and content filter triggers. Include retry logic and fallback behavior for each.

#### 5. Token Management and Cost Control (`token-management`)
- **Teaches:** How tokens work (tokenization, input vs. output tokens). Estimating costs. Prompt caching. Techniques to reduce token usage without sacrificing quality (shorter system prompts, structured output, selective context). Setting budgets and alerts.
- **Example:** Bad — sending 50k tokens of context for every query when most queries only need 2k. Good — tiered approach: quick lookup with minimal context first, escalate to full context only if needed.
- **Exercise:** Given a use case with projected volume (10k queries/day, average 2k input + 500 output tokens), calculate monthly costs, then design 3 optimization strategies to reduce costs by 40% without degrading quality.

#### 6. Safety and Content Filtering (`safety-filtering`)
- **Teaches:** Input validation and sanitization. Output filtering for harmful content. PII detection and redaction. Prompt injection defenses. Building layered safety (input filter → system prompt guardrails → output filter). Logging for audit.
- **Example:** Bad — sending user input directly to the model with no checks. Good — layered pipeline with input sanitization, system prompt boundaries, output classification, and PII redaction before returning to the user.
- **Exercise:** Design a safety pipeline for a public-facing chatbot: specify input validation rules, system prompt safety instructions, output checks, PII handling, and what to log for auditing.

### Files to Create
1. `content/implementation-patterns/01-streaming.ts`
2. `content/implementation-patterns/02-tool-use.ts`
3. `content/implementation-patterns/03-multi-turn.ts`
4. `content/implementation-patterns/04-error-handling-retries.ts`
5. `content/implementation-patterns/05-token-management.ts`
6. `content/implementation-patterns/06-safety-filtering.ts`
7. `content/implementation-patterns/index.ts`

### File to Modify
- `lib/content.ts` — import `implementationPatternsModule`, replace `comingSoon` placeholder.

---

## Implementation Notes

For each module, the process is identical:

1. Create `content/<module-slug>/` directory
2. Create lesson files (`01-*.ts` through `06-*.ts`), each exporting a `Lesson` object
3. Create `index.ts` exporting a `Module` object with all lessons
4. Update `lib/content.ts`: add import, replace the `comingSoon` placeholder with the imported module
5. Verify: `npm run build` (zero errors), `npm run lint` (clean), dev server smoke test

Each lesson file follows the exact structure in `lib/types.ts`:
- `slug`, `title`, `description`, `order`
- `content`: `explanation` (markdown string), `whyItMatters`, `keyPrinciples` (array)
- `example`: `scenario`, `bad` (with annotations), `good` (with annotations)
- `exercise`: `instructions`, `starterCode`, `hints`, `validation` (array of rules), `sampleSolution`

Validation rules use: `contains`, `not-contains`, `min-length`, `has-section`, `regex`. No LLM calls needed — all validation is structural.
