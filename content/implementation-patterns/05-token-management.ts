import { Lesson } from "@/lib/types";

export const tokenManagement: Lesson = {
  slug: "token-management",
  title: "Token Management and Cost Control",
  description:
    "Learn how tokenization works, how to estimate costs, and techniques for optimizing token usage without sacrificing quality.",
  order: 5,
  content: {
    explanation: `Tokens are the fundamental unit of LLM pricing and the primary constraint on what you can send to and receive from a model. Understanding how tokenization works and managing token consumption is essential for building cost-effective production systems.

**How Tokens Work**

Tokens are not words — they're subword units created by a tokenizer (like BPE, Byte Pair Encoding). Common words like "the" are a single token, while uncommon words get split into multiple tokens. Rough approximations: 1 token is about 4 characters or 0.75 words in English. But this varies significantly — code tends to use more tokens per character than prose, and non-English languages often require more tokens per word.

**Input vs. Output Tokens**

LLM APIs charge separately for input tokens (your prompt) and output tokens (the model's response). Output tokens are typically 3-5x more expensive than input tokens. This cost asymmetry has major implications:

- A verbose system prompt (input) costs less per token than a verbose response (output)
- Asking the model to "be concise" can save more money than shortening your prompt
- Structured output (JSON) is often cheaper than prose because it's more token-dense

**Cost Estimation**

To estimate costs, calculate: (input_tokens x input_price) + (output_tokens x output_price) per request, then multiply by expected daily volume. For example, at $3/million input tokens and $15/million output tokens, a request with 2,000 input tokens and 500 output tokens costs about $0.0135. At 10,000 requests/day, that's $135/day or roughly $4,000/month.

**Prompt Caching**

Many providers offer prompt caching, where repeated identical prompt prefixes are cached and charged at a reduced rate (often 90% less). This is powerful for applications where the system prompt and few-shot examples are the same across many requests. Structure your prompts with the static content first and variable content (user input) last to maximize cache hit rates.

**Reducing Token Usage**

Practical strategies for cutting token consumption:

- **Shorter system prompts** — eliminate redundant instructions, use concise language, remove examples that don't improve quality
- **Selective context** — instead of sending the user's entire document, extract only the relevant section for the current task
- **Structured output** — request JSON or key-value formats instead of prose explanations when the output feeds into code
- **Tiered model routing** — use a cheaper, faster model for simple tasks (classification, extraction) and reserve expensive models for complex tasks (reasoning, creative writing)
- **Caching responses** — cache LLM outputs for identical or near-identical queries, especially for common questions

**Budgets and Alerts**

Set up cost controls at multiple levels:

- **Per-request limits** — cap max_tokens to prevent runaway generation (e.g., a response that generates 100k tokens due to a loop)
- **Per-user limits** — rate limit by user to prevent abuse (e.g., 100 requests/hour per user)
- **Daily/monthly budgets** — set hard spending limits with alerts at 50%, 80%, and 95% thresholds
- **Anomaly detection** — alert on sudden cost spikes that might indicate a bug, abuse, or unexpected traffic pattern

**Monitoring Token Usage**

Track tokens per request, per user, per feature, and per model. This data helps you identify which features are cost-effective and where optimization efforts will have the biggest impact. A single expensive prompt that runs 100,000 times a day is a better optimization target than ten cheap prompts that run once each.`,
    whyItMatters:
      "LLM API costs can scale from hundreds to tens of thousands of dollars per month as usage grows. Without active token management, costs spiral unpredictably. Understanding tokenization, optimizing prompts, and implementing cost controls is essential for any sustainable LLM-powered application. The difference between a well-optimized and a naive implementation can be 3-5x in monthly costs.",
    keyPrinciples: [
      "Output tokens cost 3-5x more than input tokens, so reducing response verbosity has the highest cost impact per optimization effort",
      "Use prompt caching by placing static content (system prompt, examples) before variable content (user input) to maximize cache hits",
      "Route simple tasks to cheaper models and reserve expensive models for complex reasoning to reduce average cost per request",
      "Set per-request, per-user, and daily spending limits with alerts to catch cost anomalies before they become budget emergencies",
    ],
  },
  example: {
    scenario:
      "A document analysis application sends user documents to an LLM for summarization. The team is concerned about costs as they scale from 1,000 to 10,000 queries per day.",
    bad: {
      userMessage: `Summarize this quarterly report for me.

[Full 80-page quarterly report pasted — approximately 50,000 tokens]`,
      assistantResponse: `Here is a comprehensive summary of the Q3 quarterly report:

**Executive Overview**
The company had a strong third quarter with revenue of $45.2 million, representing a 12% year-over-year increase. The growth was primarily driven by the enterprise segment, which grew 18% while the consumer segment remained flat at 2% growth. Operating margins improved from 15% to 18% due to cost optimization initiatives launched in Q2.

[... continues for 2,000 tokens with detailed section-by-section summary ...]

**Financial Details**
Revenue breakdown by segment shows enterprise at $28.1M (up from $23.8M), consumer at $12.4M (up from $12.2M), and services at $4.7M (up from $4.2M). EBITDA was $9.5M, up from $7.8M in Q3 of the prior year.

[... another 1,500 tokens of financial details the user didn't ask for ...]

**Complete Appendix Summary**
The appendix contains 15 supplementary tables including...

[Total: ~50,000 input tokens + ~4,000 output tokens]
[Cost per request: ~$0.21]
[At 10,000 requests/day: ~$2,100/day = ~$63,000/month]`,
      annotations: [
        {
          text: "Full 80-page quarterly report pasted — approximately 50,000 tokens",
          note: "The entire document is sent regardless of the query. Most summarization requests only need key sections. Sending 50k tokens when 5k would suffice wastes 90% of input costs.",
        },
        {
          text: "continues for 2,000 tokens with detailed section-by-section summary",
          note: "The response is verbose because there's no instruction to be concise. At 3-5x the input token price, these extra output tokens are the most expensive part of the request.",
        },
        {
          text: "~$63,000/month",
          note: "At scale, the naive approach costs $63K/month. No caching, no context optimization, no model routing — every penny of this is avoidable waste.",
        },
      ],
    },
    good: {
      userMessage: `Summarize this quarterly report for me.

[System extracts key sections: executive summary, financial highlights, outlook — approximately 5,000 tokens]
[Prompt cache hit on system prompt and instructions: 90% discount on 1,000 cached tokens]`,
      assistantResponse: `**Q3 Summary:**
- Revenue: $45.2M (+12% YoY), led by enterprise segment (+18%)
- Operating margin: improved to 18% (from 15%) via Q2 cost initiatives
- Outlook: targeting 15% growth in Q4 with new product launches

Key risk: consumer segment flat at 2% growth — diversification needed.

[Total: ~5,000 input tokens (1,000 cached) + ~200 output tokens]
[Cost per request: ~$0.015]
[At 10,000 requests/day: ~$150/day = ~$4,500/month]

[Additionally: responses for repeated common queries served from cache — ~30% of requests at near-zero marginal cost]`,
      annotations: [
        {
          text: "extracts key sections: executive summary, financial highlights, outlook",
          note: "Pre-processing extracts only relevant sections, reducing input tokens from 50k to 5k — a 90% reduction. The extraction step is cheap (regex or a fast model) compared to sending the full document.",
        },
        {
          text: "Prompt cache hit on system prompt",
          note: "The system prompt and summarization instructions are identical across all requests, so they're cached at 90% discount. Placing static content first maximizes cache hit rates.",
        },
        {
          text: "~200 output tokens",
          note: "The prompt asks for a concise summary with bullet points. Since output tokens cost 3-5x more than input tokens, this conciseness saves disproportionately on the most expensive token type.",
        },
        {
          text: "~$4,500/month",
          note: "The optimized approach costs $4,500/month vs. $63,000/month — a 93% cost reduction. The combination of selective context, caching, and concise output compounds into massive savings at scale.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** You're planning an LLM-powered customer support chatbot projected to handle 10,000 queries per day. The average query uses 2,000 input tokens and 500 output tokens. Pricing is $3 per million input tokens and $15 per million output tokens.

Your plan must include:
1. **Cost calculation** — calculate the baseline monthly cost with no optimization
2. **Three optimization strategies** — design specific, implementable strategies to reduce total cost by at least 40%
3. **Projected savings** — estimate the cost reduction for each strategy with concrete numbers
4. **Monitoring plan** — how you'll track token usage and costs over time

Show your math and explain why each strategy works.`,
    starterCode: `## Token Management Plan: Customer Support Chatbot

### Baseline Cost Calculation
- Volume: 10,000 queries/day
- Average input: 2,000 tokens/query
- Average output: 500 tokens/query
- Input price: $3/million tokens
- Output price: $15/million tokens

**Monthly cost:** [calculate]

### Optimization Strategy 1: [name]
[Description and projected savings]

### Optimization Strategy 2: [name]
[Description and projected savings]

### Optimization Strategy 3: [name]
[Description and projected savings]

### Total Projected Savings
[Summary of all strategies combined]

### Monitoring Plan
[How you track and control costs]`,
    hints: [
      "Baseline: (10k * 2000 * $3/1M) + (10k * 500 * $15/1M) = $60 + $75 = $135/day = ~$4,050/month.",
      "Prompt caching can save 90% on the cached portion of input tokens — calculate how much of your input is static vs. variable.",
      "Tiered model routing sends simple queries to cheaper models — estimate what percentage of support queries are simple.",
      "Caching LLM responses for repeated common questions can eliminate API calls entirely for those queries.",
    ],
    validation: [
      {
        type: "min-length",
        value: 400,
        message:
          "Your plan needs more detail — include specific calculations for each strategy.",
      },
      {
        type: "regex",
        value: "\\$[0-9,]|[Cc]ost|[Pp]rice|[Mm]illion",
        message:
          "Include specific cost calculations with dollar amounts.",
      },
      {
        type: "regex",
        value: "[Ss]trateg(y|ies)|[Oo]ptimiz(e|ation)",
        message:
          "Define at least three specific optimization strategies.",
      },
      {
        type: "regex",
        value: "[Cc]ach(e|ing)|[Rr]out(e|ing)|[Tt]ier",
        message:
          "Include caching or model routing as at least one optimization strategy.",
      },
      {
        type: "regex",
        value: "40%|[Rr]educ(e|tion|ing)|[Ss]av(e|ing)",
        message:
          "Show that your combined strategies achieve at least 40% cost reduction.",
      },
      {
        type: "regex",
        value: "[Mm]onitor|[Aa]lert|[Tt]rack|[Dd]ashboard",
        message:
          "Include a monitoring plan for tracking token usage and costs over time.",
      },
    ],
    sampleSolution: `## Token Management Plan: Customer Support Chatbot

### Baseline Cost Calculation
- Volume: 10,000 queries/day = 300,000 queries/month
- Average input: 2,000 tokens/query = 20M input tokens/day = 600M input tokens/month
- Average output: 500 tokens/query = 5M output tokens/day = 150M output tokens/month
- Input cost: 600M * $3/1M = $1,800/month
- Output cost: 150M * $15/1M = $2,250/month

**Monthly baseline cost: $4,050/month** ($135/day)

Target: reduce by 40% = save at least $1,620/month, bringing total to $2,430 or less.

### Optimization Strategy 1: Prompt Caching
**Description:** Our system prompt and few-shot examples are identical across all queries (~800 of the 2,000 input tokens). By structuring prompts with static content first, we qualify for prompt caching at 90% discount on cached tokens.

**Calculation:**
- Cached tokens: 800/query * 300k queries = 240M tokens/month
- Savings: 240M * $3/1M * 0.9 (discount) = $648/month saved on input tokens
- New input cost: $1,800 - $648 = $1,152/month

**Projected savings: $648/month (16% of baseline)**

### Optimization Strategy 2: Tiered Model Routing
**Description:** Analysis of our support ticket data shows ~60% of queries are simple (password resets, order status, FAQ-type questions). We route these to a smaller, cheaper model (e.g., Haiku-class at $0.25/1M input, $1.25/1M output) and reserve the expensive model for complex queries (40%).

**Calculation:**
- Simple queries (60%): 180k queries/month
  - Input: 180k * 2,000 = 360M tokens at $0.25/1M = $90
  - Output: 180k * 500 = 90M tokens at $1.25/1M = $112.50
  - Subtotal: $202.50/month
- Complex queries (40%): 120k queries/month (still on expensive model)
  - Input: 120k * 2,000 = 240M tokens at $3/1M = $720
  - Output: 120k * 500 = 60M tokens at $15/1M = $900
  - Subtotal: $1,620/month
- Combined: $1,822.50/month vs. $4,050 baseline

**Projected savings: $2,227.50/month (55% of baseline)** — but this overlaps with Strategy 1, so we combine below.

### Optimization Strategy 3: Response Caching for Repeated Queries
**Description:** ~25% of support queries are near-identical (same question, different users). We cache LLM responses keyed by normalized query + relevant context. Cache TTL: 24 hours for factual answers, 1 hour for account-specific queries.

**Calculation:**
- Cached queries: 25% of 300k = 75,000 queries/month at $0 marginal cost
- Remaining queries: 225,000/month
- This stacks with other strategies — we eliminate 25% of all API calls entirely

**Projected savings: ~$1,012/month (25% of baseline)**

### Total Projected Savings (Combined)
Applying all three strategies together (accounting for overlaps):
1. Start with 300k queries/month
2. Response caching eliminates 25% → 225k queries reach the API
3. Of those, 60% (135k) route to cheap model, 40% (90k) to expensive model
4. Both tiers benefit from prompt caching on static content

**Optimized monthly cost:**
- Cheap model (135k queries):
  - Input: 135k × 2,000 = 270M tokens (80% cached at 90% discount)
    - Cached: 216M × $0.025/1M = $5.40
    - Uncached: 54M × $0.25/1M = $13.50
  - Output: 67.5M × $1.25/1M = $84.38
  - Subtotal: $103.28/month
- Expensive model (90k queries):
  - Input: 90k × 2,000 = 180M tokens (80% cached at 90% discount)
    - Cached: 144M × $0.30/1M = $43.20
    - Uncached: 36M × $3/1M = $108.00
  - Output: 45M × $15/1M = $675.00
  - Subtotal: $826.20/month
- Total: $103.28 + $826.20 = $929.48/month

**Total reduction: ~$3,120/month (77% savings vs. $4,050 baseline)**. This exceeds the 40% target by a wide margin.

### Monitoring Plan
**Dashboard metrics (real-time):**
- Token usage per request (input, output, cached) — track P50, P95, P99
- Cost per request, per user, per feature
- Cache hit rate (target: >25% for response cache, >90% for prompt cache)
- Model routing distribution (should stay near 60/40 split)

**Alerts:**
- Daily cost exceeds $50 (150% of expected $36/day) — investigate immediately
- Cache hit rate drops below 15% — check cache invalidation logic
- Average tokens per request exceeds 3,000 — check for prompt bloat or context leaks
- Any single user exceeds 200 requests/hour — potential abuse

**Weekly review:**
- Review top 10 most expensive queries and optimize prompts if possible
- Check model routing accuracy — are complex queries being misrouted to the cheap model?
- Update cached responses if product information has changed`,
  },
};
