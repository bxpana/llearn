import { Lesson } from "@/lib/types";

export const ragEvaluation: Lesson = {
  slug: "rag-evaluation",
  title: "RAG Pipeline Evaluation",
  description:
    "Learn to evaluate RAG systems end-to-end with separate retrieval and generation metrics to diagnose failure modes.",
  order: 6,
  content: {
    explanation: `Evaluating a RAG system end-to-end is harder than evaluating either retrieval or generation alone, because failures can originate at any stage. A wrong answer might mean the retrieval found the wrong documents, or it might mean the right documents were found but the LLM used them poorly. **Separating retrieval evaluation from generation evaluation** is the key to diagnosing and fixing RAG failures efficiently.

**End-to-end evaluation** measures the final output quality — does the user get a correct, complete, well-cited answer? This gives you the "business metric" that matters, but it doesn't tell you where to focus improvements. For that, you need component-level metrics.

**Retrieval metrics** (evaluated independently of the LLM):

- **Precision@k** — Of the k retrieved chunks, what fraction are relevant? Low precision means the LLM's context is polluted with noise.
- **Recall@k** — Of all relevant chunks in the knowledge base, what fraction were retrieved? Low recall means the LLM is missing critical information.
- **MRR (Mean Reciprocal Rank)** — How high does the first relevant result appear? Low MRR means users wait through irrelevant content before getting value.

**Generation metrics** (evaluated with known-good context):

- **Faithfulness** — Does the response only contain claims supported by the provided context? Low faithfulness means the LLM is hallucinating beyond the provided documents.
- **Relevance** — Does the response actually address the user's question? A faithful but off-topic response fails on relevance.
- **Completeness** — Does the response cover all the important information in the retrieved context? A response that only uses one of three relevant chunks is incomplete.
- **Citation accuracy** — Are citations correct? Does each cited source actually support the claim it's attached to?

**Building an evaluation dataset** requires careful construction:

1. **Collect representative queries** (30-50 minimum) — Cover common questions, edge cases, multi-hop questions, and queries where the answer isn't in the knowledge base
2. **Annotate ground truth** — For each query, identify the relevant chunks AND the expected answer
3. **Include negative cases** — Queries that should return "I don't know" because the knowledge base doesn't contain the answer
4. **Version your dataset** — As your knowledge base changes, your eval dataset must be updated to match

**Common failure modes** in RAG systems:

- **Wrong context, right format** — The retrieval returns plausible-looking but incorrect chunks. The LLM generates a well-formatted, confident answer using the wrong information. This is the most dangerous failure because it looks correct.
- **Right context, hallucinated details** — The correct chunks are retrieved, but the LLM adds details from its training data instead of sticking to the provided context. Often happens with specific numbers, dates, or procedures.
- **Partial retrieval** — Some relevant chunks are found but key ones are missed. The LLM gives a partially correct answer, missing important caveats or conditions.
- **Context ignored** — The LLM ignores the retrieved context entirely and answers from training knowledge. This often happens when the prompt doesn't strongly enough instruct the model to use only the provided context.
- **Citation fabrication** — The LLM invents citations that don't match any provided source, or attributes a claim to the wrong source document.

**Practical evaluation workflow:**

1. Run retrieval evaluation independently — calculate precision@k and recall@k
2. Run generation evaluation with gold-standard context — measure faithfulness, relevance, completeness
3. Run end-to-end evaluation — measure final answer quality
4. Compare results: if end-to-end is poor but generation-with-gold-context is good, the problem is retrieval
5. Automate and run after every pipeline change (new chunks, model updates, prompt changes)

**Evaluation approaches for generation** range from simple to sophisticated:

- **Rule-based checks** — Does the response contain required keywords? Does it cite sources? Is it above a minimum length?
- **LLM-as-judge** — Use a separate LLM to score faithfulness, relevance, and completeness against the reference answer
- **Human evaluation** — Domain experts rate responses (gold standard but expensive and slow)

Start with rule-based checks plus LLM-as-judge for fast iteration, then validate with periodic human evaluation.`,
    whyItMatters:
      "RAG systems have multiple failure points, and optimizing the wrong component wastes time and resources. Separate evaluation of retrieval and generation gives you a clear diagnostic signal — you know exactly where to invest effort. Without this separation, teams often spend weeks tweaking prompts when the real problem is poor chunking, or vice versa.",
    keyPrinciples: [
      "Evaluate retrieval and generation separately so you can pinpoint whether failures originate in document search or in the LLM's use of context.",
      "Faithfulness (only stating what's in the context) is the most critical generation metric for RAG because it directly measures hallucination.",
      "Include negative test cases where the knowledge base doesn't have the answer to verify the system says 'I don't know' instead of hallucinating.",
      "Automate your evaluation pipeline and run it after every change to chunking, embeddings, retrieval parameters, or generation prompts.",
    ],
  },
  example: {
    scenario:
      "A team deployed a RAG-powered Q&A bot for their product documentation. Users report some answers are wrong, but the team doesn't know whether the problem is retrieval or generation.",
    bad: {
      userMessage: `Our RAG bot gave a wrong answer about pricing. Here's what happened:

Query: "What's the price of the Pro plan?"
Bot answer: "The Pro plan costs $29/month and includes unlimited projects."

The actual price is $19/month and the Pro plan includes 10 projects, not unlimited. How should we evaluate this?`,
      assistantResponse: `Let's evaluate the system:

**Test result:** FAIL — The bot said $29/month but the correct answer is $19/month.

**Fix:** Update the prompt to be more careful about pricing information. Add an instruction like "Double-check all pricing information before responding."

**Additional tests to run:**
1. Ask about Basic plan pricing
2. Ask about Enterprise plan pricing
3. Ask about feature comparisons

If these pass, the system is probably fine and this was a one-off error.`,
      annotations: [
        {
          text: "Update the prompt to be more careful about pricing information",
          note: "This fix is a guess — the team doesn't know if the wrong price came from bad retrieval (wrong chunks) or bad generation (right chunks, wrong interpretation). 'Be more careful' is not actionable.",
        },
        {
          text: "this was a one-off error",
          note: "Without systematic evaluation, there's no way to know if this is isolated or widespread. A single test case tells you almost nothing about system reliability.",
        },
      ],
    },
    good: {
      userMessage: `Our RAG bot gave a wrong answer about pricing. Here's what happened:

Query: "What's the price of the Pro plan?"
Bot answer: "The Pro plan costs $29/month and includes unlimited projects."

The actual price is $19/month and the Pro plan includes 10 projects, not unlimited. How should we evaluate this?`,
      assistantResponse: `Let's diagnose this systematically by evaluating retrieval and generation separately.

**Step 1: Evaluate retrieval (did we get the right chunks?)**

Run the query "What's the price of the Pro plan?" through retrieval only and inspect the returned chunks:

| Chunk | Source | Contains correct pricing? |
|-------|--------|--------------------------|
| Chunk 1 | Pricing Page v2023 (outdated) | "$29/month, unlimited projects" ⚠️ |
| Chunk 2 | Blog: Plan Comparison | General feature overview, no pricing |
| Chunk 3 | Pricing Page v2024 (current) | "$19/month, 10 projects" ✅ |

**Diagnosis:** The retrieval returned an outdated pricing page (2023) as the top result. The current pricing page was retrieved but ranked lower. The LLM used the top-ranked (but outdated) chunk.

**Step 2: Evaluate generation with gold-standard context**

Feed the correct chunk (Pricing Page v2024) directly to the LLM:
- Does it output "$19/month"? → Yes ✅
- Does it say "10 projects"? → Yes ✅
- Does it cite the source? → Yes ✅

**Diagnosis:** Generation works correctly when given the right context. The problem is retrieval ranking.

**Step 3: Fix and verify**

- **Root cause:** Outdated document ranked above current document
- **Fix:** Add date-based boosting to retrieval (prefer newer documents) or remove the outdated pricing page from the index
- **Verification:** Re-run the pricing eval suite (all pricing queries) to confirm the fix works and doesn't break other queries

**Eval suite to build (prevent recurrence):**

| Query | Expected answer | Retrieval check | Generation check |
|-------|----------------|-----------------|-----------------|
| "Pro plan price" | $19/month, 10 projects | Top chunk = Pricing v2024 | Correct price cited |
| "Basic plan price" | $9/month, 3 projects | Top chunk = Pricing v2024 | Correct price cited |
| "Enterprise pricing" | "Contact sales" | Top chunk = Enterprise page | Says "contact sales" |
| "Do you have a free tier?" | Yes, free plan details | Top chunk = Pricing v2024 | Correct features listed |`,
      annotations: [
        {
          text: "Step 1: Evaluate retrieval",
          note: "By inspecting retrieved chunks separately, the team immediately sees that an outdated document was ranked highest — something invisible in an end-to-end-only evaluation.",
        },
        {
          text: "Step 2: Evaluate generation with gold-standard context",
          note: "Testing generation with correct context proves the LLM is working fine. This isolates the failure to retrieval and prevents wasting time on prompt changes.",
        },
        {
          text: "Eval suite to build",
          note: "A systematic eval suite with both retrieval checks and generation checks catches future regressions and covers the full pricing surface area.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design an end-to-end evaluation plan for a RAG-based HR policy bot. The bot answers employee questions using an indexed set of HR documents (handbook, benefits guide, PTO policy, code of conduct).

Your evaluation plan must include:
1. At least 5 test cases with queries, expected answers, and relevant source documents
2. Separate retrieval metrics and generation metrics
3. At least one negative test case (query the knowledge base can't answer)
4. Specific pass/fail criteria for both retrieval and generation
5. A description of common failure modes you'd watch for`,
    starterCode: `## RAG Evaluation Plan: HR Policy Bot

### Test cases
| # | Query | Expected answer | Relevant sources | Negative case? |
|---|-------|----------------|-----------------|----------------|
| 1 | | | | |

### Retrieval metrics
[What you measure and pass criteria]

### Generation metrics
[What you measure and pass criteria]

### Failure modes to monitor
[What can go wrong and how you'd detect it]`,
    hints: [
      "Include a mix of simple lookups (PTO balance), multi-document questions (comparing benefits), and out-of-scope queries.",
      "For retrieval metrics, use precision@k and recall@k with specific k values matching your production setup.",
      "For generation metrics, evaluate faithfulness (no hallucinated policies), completeness, and citation accuracy.",
      "Think about what happens when HR policies get updated — outdated documents are a common failure mode.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your evaluation plan needs more detail — include all test cases, metrics, criteria, and failure modes.",
      },
      {
        type: "regex",
        value: "[Pp]recision|[Rr]ecall",
        message:
          "Include precision and recall metrics for evaluating retrieval quality.",
      },
      {
        type: "regex",
        value: "[Ff]aithful|[Hh]allucinat|[Gg]rounded|[Ss]upported by",
        message:
          "Include faithfulness as a generation metric — does the response only state what's in the provided context?",
      },
      {
        type: "regex",
        value: "[Nn]egative|[Oo]ut.of.scope|[Cc]annot answer|[Dd]on't know|[Nn]ot in|[Uu]nanswer",
        message:
          "Include at least one negative test case where the bot should say 'I don't know'.",
      },
      {
        type: "regex",
        value: "[Ff]ailure [Mm]ode|[Oo]utdated|[Ss]tale|[Ww]rong [Cc]ontext|[Cc]itation",
        message:
          "Describe specific failure modes to monitor, such as outdated documents or citation errors.",
      },
      {
        type: "regex",
        value: "[Rr]etrieval.*[Gg]eneration|[Ss]eparat|[Ii]solat|[Cc]omponent",
        message:
          "Explain how you evaluate retrieval and generation as separate components to isolate failures.",
      },
    ],
    sampleSolution: `## RAG Evaluation Plan: HR Policy Bot

### Test cases

| # | Query | Expected answer | Relevant sources | Negative case? |
|---|-------|----------------|-----------------|----------------|
| 1 | "How many PTO days do I get per year?" | 15 days for 0-3 years tenure, 20 days for 3+ years | PTO Policy doc, Section 2.1 | No |
| 2 | "What's covered under our dental plan?" | Preventive care 100%, basic procedures 80%, major procedures 50%, $2,000 annual max | Benefits Guide, Dental section | No |
| 3 | "Can I work remotely on Fridays?" | Hybrid policy allows 2 remote days/week, employee chooses which days with manager approval | Employee Handbook, Section 5.3 — Remote Work | No |
| 4 | "What happens if I violate the code of conduct?" | Progressive discipline: verbal warning, written warning, PIP, termination. Severity-dependent — some violations are immediate termination | Code of Conduct, Section 8; Handbook Section 9.2 — Disciplinary Process | No |
| 5 | "How does our 401k matching compare to our health insurance deductible?" | 401k: 100% match on first 3%, 50% on next 2%. Health insurance: $500 individual / $1,000 family deductible | Benefits Guide, 401k section; Benefits Guide, Health Insurance section | No |
| 6 | "What's the company's policy on cryptocurrency investments?" | Should respond: "I don't have information about a cryptocurrency investment policy in the available HR documents." | None — out of scope for HR docs | Yes (negative) |
| 7 | "Who is our current CEO?" | Should respond: "I don't have that information in the available HR documents. Please contact HR for organizational questions." | None — not in HR policy documents | Yes (negative) |

### Retrieval metrics

**Measured at k=5 (matching production retrieval count):**

- **Precision@5** >= 0.70 — At least 3-4 of 5 retrieved chunks should be relevant. Prevents context pollution.
- **Recall@5** >= 0.85 — Must retrieve at least 85% of relevant documents. Ensures no critical policy information is missed.
- **MRR** >= 0.80 — First relevant chunk should typically be in position 1 or 2.

**Pass criteria:**
- All metric averages must meet thresholds across the full test suite
- No individual query may have recall@5 = 0 (every answerable query must retrieve at least one relevant chunk)
- Negative cases (6, 7) must NOT retrieve any highly-relevant chunks (top-1 similarity score < 0.5)

Retrieval evaluation is run independently of the LLM — we inspect retrieved chunk IDs against the annotated ground truth.

### Generation metrics

**Evaluated with gold-standard context (correct chunks provided manually) to isolate generation quality:**

- **Faithfulness** >= 0.95 — The response must only contain claims supported by the provided context. This is the most critical metric. Any hallucinated policy detail (wrong dollar amounts, invented procedures) is a serious failure. Measured by having a judge LLM verify each claim against the source chunks.
- **Relevance** >= 0.90 — The response must address the user's actual question. A faithful but off-topic response fails.
- **Completeness** >= 0.80 — The response should cover all key points from the relevant context. Partial answers are penalized.
- **Citation accuracy** >= 0.90 — Each citation must correctly reference the source that supports the claim. Measured by checking each [Source: X] tag against the actual content of document X.

**Pass criteria:**
- Faithfulness is a hard gate — any test case scoring below 0.8 on faithfulness is an automatic overall fail
- Negative cases must produce an "I don't know" response (not a hallucinated answer)
- All other metrics are averaged across the test suite

### Failure modes to monitor

1. **Outdated document retrieval** — HR policies are updated annually. If old versions aren't removed from the index, the bot might cite a stale PTO policy or old benefits numbers. Monitor by including test cases where current and outdated documents exist, and verifying the current version is preferred.

2. **Wrong context, confident answer** — Retrieval returns chunks about a different but related policy (e.g., returns the sick leave policy when asked about PTO). The LLM generates a well-formatted answer using the wrong information. This is the most dangerous failure mode because it looks correct. Detect by checking retrieval precision on every eval run.

3. **Hallucinated policy details** — The LLM invents specific numbers, dates, or procedures not in the retrieved context. For example, adding a "30-day notice period" that doesn't exist in any HR document. Catch with faithfulness scoring using LLM-as-judge that cross-references every claim against source chunks.

4. **Citation fabrication** — The LLM attributes a claim to a document that doesn't actually contain that information, or invents a source name that doesn't exist. Verify by programmatically checking that cited source names match documents in the knowledge base and that the cited content appears in those documents.

5. **Failure to say "I don't know"** — On out-of-scope queries (test cases 6 and 7), the bot answers from training knowledge instead of acknowledging the gap. This is especially problematic for HR topics where incorrect information could have legal consequences. Monitor with the negative test cases in every eval run.

**Evaluation cadence:** Run the full automated suite after every change to the retrieval pipeline, prompt, or document index. Run human evaluation quarterly to validate that automated metrics correlate with actual answer quality.`,
  },
};
