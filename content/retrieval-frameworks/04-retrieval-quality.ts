import { Lesson } from "@/lib/types";

export const retrievalQuality: Lesson = {
  slug: "retrieval-quality",
  title: "Retrieval Quality",
  description:
    "Learn to measure and improve retrieval quality using precision, recall, re-ranking, and hybrid search.",
  order: 4,
  content: {
    explanation: `Retrieval quality is the most important factor in RAG performance. If you retrieve the wrong documents, even the best LLM will produce a wrong answer. Measuring and improving retrieval quality requires understanding **precision**, **recall**, and the techniques that optimize both.

**Precision** measures what fraction of retrieved documents are actually relevant. If you retrieve 10 chunks and only 3 are relevant, your precision@10 is 0.3 (30%). High precision means the LLM's context isn't polluted with irrelevant information that could distract or mislead the model.

**Recall** measures what fraction of all relevant documents were successfully retrieved. If your knowledge base has 5 chunks relevant to a query and your system retrieves 3 of them, recall@10 is 0.6 (60%). High recall means you're not missing important information that the LLM needs to give a complete answer.

**The precision-recall tradeoff:** Retrieving more documents (higher k) tends to improve recall but hurt precision. Retrieving fewer documents improves precision but risks missing relevant content. The sweet spot depends on your use case — a medical Q&A system might prioritize recall (don't miss critical info), while a quick-answer chatbot might prioritize precision (don't overwhelm the context).

**Top-k selection** is your first lever. Start with a reasonable k (5-10) and evaluate. Too low and you miss relevant chunks. Too high and you include irrelevant chunks that dilute context quality and increase cost/latency.

**Re-ranking** is a powerful technique to improve precision without sacrificing recall. The strategy is:

1. **Initial retrieval** — Use fast vector search to retrieve a larger set (e.g., top-20)
2. **Re-ranking** — Apply a more sophisticated (but slower) model to re-score and reorder the results
3. **Final selection** — Take the top-3 to top-5 from the re-ranked list

Re-ranking models (like Cohere Rerank, or cross-encoder models) compare the query against each candidate chunk more carefully than a simple embedding similarity score. They can catch nuances that embedding search misses. The two-stage approach gives you the speed of vector search with the accuracy of a cross-encoder.

**Hybrid search** combines keyword search (BM25) with semantic search (embeddings) to cover both exact-match and meaning-based queries. The typical approach is:

1. Run both a keyword search and a vector search in parallel
2. Normalize the scores from each method to a common scale
3. Combine scores using a weighted formula: \`final_score = alpha * semantic_score + (1 - alpha) * keyword_score\`
4. Return the top-k results from the combined ranking

Hybrid search handles queries where keyword matching matters (product codes, error messages, names) and queries where semantic matching matters (paraphrased questions, conceptual queries).

**Evaluating retrieval separately from generation** is critical. When a RAG system gives a wrong answer, you need to know whether the problem was retrieval (wrong chunks were fetched) or generation (right chunks were fetched but the LLM used them poorly). Build a retrieval evaluation set:

1. Collect 20-50 representative queries
2. For each query, identify the relevant chunks in your knowledge base (ground truth)
3. Run each query through your retrieval pipeline
4. Calculate precision@k and recall@k for each query
5. Aggregate into average precision and recall scores

This evaluation should be automated and run after any change to chunking, embedding models, or search parameters. Without it, you're optimizing blind.`,
    whyItMatters:
      "Retrieval is the foundation of RAG — if the wrong context is retrieved, the LLM has no chance of producing a correct answer. Separately measuring retrieval quality gives you a clear signal for where to invest optimization effort. Teams that skip retrieval evaluation waste time tweaking generation prompts when the real problem is that the right documents never reach the model.",
    keyPrinciples: [
      "Precision measures how many retrieved documents are relevant, while recall measures how many relevant documents were successfully retrieved.",
      "Re-ranking retrieves a large initial set with fast vector search, then applies a more accurate model to select the best results.",
      "Hybrid search combines keyword and semantic search to handle both exact-match queries and meaning-based queries effectively.",
      "Always evaluate retrieval quality separately from generation quality so you can identify whether failures originate in search or in the LLM.",
    ],
  },
  example: {
    scenario:
      "A developer is building a RAG system for a product documentation site and needs to decide how many chunks to include in the LLM's context.",
    bad: {
      userMessage: `Our RAG system retrieves the top-20 most similar chunks for every query and includes all of them in the LLM context. Users are complaining that answers are sometimes inaccurate or mention irrelevant features. How should we handle this?`,
      assistantResponse: `I'll include all 20 retrieved chunks in the prompt to make sure we don't miss any relevant information:

System prompt: "Answer the user's question using the following 20 context documents."

[Context 1] Getting started with API keys...
[Context 2] Pricing tier comparison...
[Context 3] How to reset your password...
[Context 4] Advanced query syntax...
[Context 5] Billing FAQ...
[Context 6-20] ... (15 more chunks of mixed relevance)

This approach maximizes recall — all possibly relevant information is available. The model should be smart enough to ignore the irrelevant chunks and focus on what matters.`,
      annotations: [
        {
          text: "top-20 most similar chunks",
          note: "Retrieving 20 chunks prioritizes recall at the extreme cost of precision. Most of these chunks are likely irrelevant, polluting the context with distracting information.",
        },
        {
          text: "The model should be smart enough to ignore the irrelevant chunks",
          note: "This is a common misconception. LLMs are influenced by everything in context — irrelevant chunks increase hallucination risk and can cause the model to mention unrelated features.",
        },
        {
          text: "[Context 6-20] ... (15 more chunks of mixed relevance)",
          note: "No filtering or re-ranking means many of these chunks are noise. The LLM wastes context window capacity on irrelevant content, increasing cost and latency too.",
        },
      ],
    },
    good: {
      userMessage: `Our RAG system retrieves the top-20 most similar chunks for every query and includes all of them in the LLM context. Users are complaining that answers are sometimes inaccurate or mention irrelevant features. How should we handle this?`,
      assistantResponse: `The issue is low precision — too many irrelevant chunks in the context. Here's a three-stage retrieval strategy:

**Stage 1: Broad retrieval (top-10 via hybrid search)**
Use hybrid search combining vector similarity and BM25 keyword matching. This catches both semantic matches and exact-term matches. Retrieve top-10 candidates.

**Stage 2: Re-rank (cross-encoder scoring)**
Pass all 10 candidates through a re-ranking model (e.g., Cohere Rerank) that scores each chunk's relevance to the specific query. This is slower than embedding similarity but much more accurate.

**Stage 3: Select top-3 with threshold**
Take the top-3 re-ranked chunks, but only include chunks scoring above a relevance threshold (e.g., 0.7). If only 2 chunks pass the threshold, only include 2. If none pass, return "I don't have enough information to answer this question."

**Expected impact:**
- Precision improves from ~15% (3 relevant out of 20) to ~90% (3 relevant out of 3)
- Context size drops from ~20 chunks to ~3 chunks (lower cost, faster responses)
- Irrelevant feature mentions should disappear since distracting chunks are filtered out

**Measure the improvement:** Run your 50-query evaluation set before and after. Track precision@3, recall@3, and end-to-end answer accuracy.`,
      annotations: [
        {
          text: "Stage 1: Broad retrieval (top-10 via hybrid search)",
          note: "Starting with hybrid search instead of pure vector search catches queries that need exact keyword matching (product names, error codes) alongside semantic matches.",
        },
        {
          text: "Stage 2: Re-rank (cross-encoder scoring)",
          note: "Re-ranking is the key improvement — it applies a more accurate relevance model to the initial candidates, dramatically improving precision without sacrificing recall.",
        },
        {
          text: "only include chunks scoring above a relevance threshold",
          note: "A relevance threshold prevents including low-quality chunks even in the top-3, and gracefully handles queries where the knowledge base simply doesn't have the answer.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design a retrieval evaluation plan for a RAG-based customer support system. The knowledge base contains 500 troubleshooting articles.

Your evaluation must include:
1. At least 4 test queries with their known relevant documents (ground truth)
2. Metrics you'll track (precision@k, recall@k) with specific k values
3. A pass/fail threshold for retrieval quality
4. A description of how you'd use re-ranking or hybrid search to improve results
5. How you'll separate retrieval evaluation from generation evaluation`,
    starterCode: `## Retrieval Evaluation Plan: Customer Support RAG

### Test queries and ground truth
| Query | Relevant document IDs |
|-------|----------------------|
| [query 1] | [doc IDs] |

### Metrics
[What you measure and at what k values]

### Pass criteria
[Thresholds for acceptable retrieval quality]

### Improvement strategy
[How re-ranking or hybrid search helps]

### Separating retrieval from generation evaluation
[How to isolate each component]`,
    hints: [
      "Include diverse query types: simple lookups, multi-step problems, queries with specific error codes.",
      "Choose k values that match your production setup — if you feed 5 chunks to the LLM, measure precision@5.",
      "Think about what threshold is acceptable: 80% precision means 1 in 5 chunks is irrelevant.",
      "To separate retrieval from generation, you can evaluate retrieval by checking if the right docs were returned before ever sending them to the LLM.",
    ],
    validation: [
      {
        type: "min-length",
        value: 400,
        message:
          "Your evaluation plan needs more detail — include test queries, metrics, thresholds, and improvement strategy.",
      },
      {
        type: "regex",
        value: "[Pp]recision|[Rr]ecall",
        message:
          "Include precision and recall as your primary retrieval metrics.",
      },
      {
        type: "regex",
        value: "[Rr]e.?rank|[Hh]ybrid|BM25|[Cc]ross.?encoder",
        message:
          "Describe how re-ranking or hybrid search can improve retrieval quality.",
      },
      {
        type: "regex",
        value: "[Tt]hreshold|[Pp]ass|[Ff]ail|[Cc]riter",
        message:
          "Define a pass/fail threshold for retrieval quality metrics.",
      },
      {
        type: "regex",
        value: "[Ss]eparat|[Ii]solat|[Ii]ndepend|[Rr]etrieval.*[Gg]eneration|[Gg]eneration.*[Rr]etrieval",
        message:
          "Explain how you separate retrieval evaluation from generation evaluation to isolate failure sources.",
      },
    ],
    sampleSolution: `## Retrieval Evaluation Plan: Customer Support RAG

### Test queries and ground truth

| Query | Relevant document IDs | Query type |
|-------|----------------------|------------|
| "How do I reset my password?" | DOC-042, DOC-043 | Simple lookup |
| "Error code ERR_CONN_REFUSED when connecting to VPN" | DOC-118, DOC-119, DOC-203 | Error code + troubleshooting |
| "My invoice shows a charge I don't recognize" | DOC-301, DOC-302, DOC-055 | Billing + multi-step |
| "App crashes on startup after latest update on Android" | DOC-087, DOC-088, DOC-210, DOC-211 | Platform-specific + multi-cause |
| "Can I use the API with Python?" | DOC-401, DOC-402, DOC-403 | Developer documentation |

Ground truth was established by having two support team members independently identify all relevant documents for each query, then reconciling disagreements.

### Metrics

**Primary metrics (measured at k=5, matching our production retrieval count):**
- **Precision@5** — what fraction of the 5 retrieved chunks are relevant
- **Recall@5** — what fraction of all relevant chunks were retrieved in the top 5

**Secondary metrics:**
- **MRR (Mean Reciprocal Rank)** — how high the first relevant result appears (1/rank)
- **Recall@10** — measured at the re-ranking candidate stage to ensure broad retrieval doesn't miss relevant docs

### Pass criteria

- **Precision@5** >= 0.70 (at least 3.5 out of 5 chunks are relevant on average)
- **Recall@5** >= 0.80 (we retrieve at least 80% of relevant documents)
- **MRR** >= 0.80 (the first relevant result is typically in position 1 or 2)
- **No query with recall@5 = 0** — every query must retrieve at least one relevant document
- Threshold must be met across all query types, not just on average (prevents hiding failures in one category)

### Improvement strategy

**Hybrid search:** Combine BM25 keyword search with vector similarity search to handle both types of queries. The error code query ("ERR_CONN_REFUSED") needs exact keyword matching, while the paraphrased query ("charge I don't recognize") needs semantic matching. Use weighted combination: \`score = 0.6 * semantic + 0.4 * keyword\`, tuned based on evaluation results.

**Re-ranking pipeline:**
1. Retrieve top-10 candidates using hybrid search (broad recall)
2. Pass all 10 through a cross-encoder re-ranker (Cohere Rerank or similar)
3. Select top-5 from re-ranked results, applying a minimum relevance threshold of 0.6
4. This should improve precision@5 significantly while maintaining recall (since we start with a broader top-10 pool)

### Separating retrieval evaluation from generation evaluation

**Retrieval evaluation runs independently of the LLM.** The process is:

1. Run each test query through the retrieval pipeline only (no LLM generation)
2. Compare retrieved document IDs against ground truth relevant IDs
3. Calculate precision@5, recall@5, and MRR
4. This tells us: "Did we find the right documents?"

**Generation evaluation runs separately, using known-good context:**
1. For each test query, manually provide the correct relevant documents as context (bypass retrieval)
2. Run the LLM generation step with this perfect context
3. Evaluate the generated answer for accuracy, completeness, and faithfulness
4. This tells us: "Given the right documents, does the LLM produce a good answer?"

**When the end-to-end system fails,** comparing these two evaluations reveals the root cause:
- Good retrieval + bad generation = prompt engineering problem
- Bad retrieval + good generation (with manual context) = retrieval pipeline problem
- Bad retrieval + bad generation = both need work, but fix retrieval first`,
  },
};
