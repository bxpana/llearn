import { Lesson } from "@/lib/types";

export const embeddingsSearch: Lesson = {
  slug: "embeddings-search",
  title: "Embeddings and Vector Search",
  description:
    "Learn how text is converted to vectors and how semantic similarity search works to find relevant content.",
  order: 3,
  content: {
    explanation: `**Embeddings** are numerical representations of text — specifically, high-dimensional vectors (arrays of numbers) that capture semantic meaning. When you embed a sentence, you get a vector where similar meanings are close together in vector space and dissimilar meanings are far apart. The sentence "How do I reset my password?" and "I need to change my login credentials" produce vectors that are very close together, even though they share almost no words.

**How embedding models work:** An embedding model (like OpenAI's text-embedding-3-small or Cohere's embed-v3) takes text as input and outputs a fixed-length vector — typically 256 to 3,072 dimensions. Each dimension captures some aspect of meaning, though individual dimensions aren't interpretable by humans. The model learned these representations during training on massive text corpora, encoding relationships like synonymy, topic similarity, and conceptual closeness.

**Semantic vs. keyword matching:** Traditional keyword search (BM25, TF-IDF) matches documents based on shared words. If you search "automobile maintenance schedule," you won't find a document titled "car service intervals" — even though they mean the same thing. Embedding-based search finds this match because both phrases map to nearby vectors. Conversely, keyword search excels when exact terminology matters: searching for error code "ERR_429" should match that exact string, not semantically similar errors.

**Choosing an embedding model** involves several tradeoffs:

- **Dimension count** — Higher dimensions (1536, 3072) capture more nuance but cost more to store and search. Lower dimensions (256, 512) are faster but less precise.
- **Context window** — Models have input token limits (typically 512 to 8,192 tokens). Your chunks must fit within this limit.
- **Domain fit** — General-purpose models work well for most content, but specialized domains (medical, legal) may benefit from domain-specific models.
- **Cost and latency** — Embedding is an API call per chunk at indexing time and per query at search time. Faster/cheaper models are preferable for high-volume systems.

**Vector databases** (Pinecone, Weaviate, Qdrant, pgvector, Chroma) store embeddings and enable fast similarity search. The core operations are:

1. **Index** — Insert vectors with associated metadata and chunk text
2. **Query** — Given a query vector, find the top-k most similar stored vectors
3. **Filter** — Narrow search by metadata (e.g., "only search documents from 2024")

**Similarity metrics** determine how "closeness" is calculated:

- **Cosine similarity** — measures the angle between vectors (most common; works well for normalized embeddings)
- **Euclidean distance** — measures straight-line distance (sensitive to vector magnitude)
- **Dot product** — measures alignment and magnitude (fast, often used with normalized vectors)

**The indexing pipeline** for a RAG system follows these steps:

1. Load and parse source documents
2. Chunk documents using your chosen strategy
3. Generate embeddings for each chunk via the embedding API
4. Store vectors alongside chunk text and metadata in the vector database
5. At query time: embed the user's query, search for top-k similar chunks, return chunk text and metadata

**Important considerations:** Embedding the query and the chunks with the same model is essential — vectors from different models live in different vector spaces and can't be compared. Also, re-indexing is required when you switch embedding models, since the old vectors are incompatible with the new model's query vectors.`,
    whyItMatters:
      "Embeddings and vector search are the engine that powers RAG retrieval. Understanding how embeddings capture semantic meaning — and where they fail compared to keyword search — is essential for building retrieval systems that find the right content. Poor embedding choices or misconfigured vector search lead to irrelevant results, which cascade into poor generated answers.",
    keyPrinciples: [
      "Embeddings convert text into high-dimensional vectors where semantically similar content is positioned close together in vector space.",
      "Semantic search finds meaning-based matches that keyword search misses, but keyword search is better for exact terms, codes, and identifiers.",
      "Choose embedding models based on dimension size, context window, domain fit, and cost — and always use the same model for indexing and querying.",
      "Vector databases store embeddings and enable fast top-k similarity search with metadata filtering for efficient retrieval at scale.",
    ],
  },
  example: {
    scenario:
      "A customer support team is building a search system over their knowledge base of troubleshooting articles to help agents find relevant solutions quickly.",
    bad: {
      userMessage: `Search our knowledge base for articles matching the customer's question: "My internet keeps dropping every few minutes"

Search method: keyword match (BM25)

Knowledge base articles:
1. "How to reset your router" — Steps to factory reset a wireless router
2. "Intermittent connectivity issues" — Diagnosing unstable WiFi connections that disconnect periodically
3. "Internet speed test guide" — How to run and interpret speed tests
4. "Setting up a new modem" — Initial modem configuration steps`,
      assistantResponse: `**Keyword search results for "internet keeps dropping every few minutes":**

1. "Internet speed test guide" (score: 0.42) — matched keyword "internet"
2. "Setting up a new modem" (score: 0.18) — partial match on "internet" in content

No strong matches found. The query terms "dropping," "keeps," and "few minutes" don't appear in any article titles or content.

Articles about "intermittent connectivity issues" were not returned because they don't contain the word "dropping" or "internet."`,
      annotations: [
        {
          text: "matched keyword \"internet\"",
          note: "Keyword search only found articles containing the exact word 'internet', missing the most relevant article about 'intermittent connectivity' because it uses different terminology.",
        },
        {
          text: "Articles about \"intermittent connectivity issues\" were not returned",
          note: "The best match (article 2) was missed entirely because keyword search can't recognize that 'dropping every few minutes' and 'disconnect periodically' mean the same thing.",
        },
      ],
    },
    good: {
      userMessage: `Search our knowledge base for articles matching the customer's question: "My internet keeps dropping every few minutes"

Search method: embedding similarity (cosine)

Knowledge base articles (pre-embedded):
1. "How to reset your router" — Steps to factory reset a wireless router
2. "Intermittent connectivity issues" — Diagnosing unstable WiFi connections that disconnect periodically
3. "Internet speed test guide" — How to run and interpret speed tests
4. "Setting up a new modem" — Initial modem configuration steps`,
      assistantResponse: `**Embedding search results for "My internet keeps dropping every few minutes":**

1. **"Intermittent connectivity issues"** (similarity: 0.92) — "Diagnosing unstable WiFi connections that disconnect periodically" — Highly relevant: "dropping every few minutes" is semantically equivalent to "disconnect periodically"
2. **"How to reset your router"** (similarity: 0.74) — Related troubleshooting step for connectivity problems
3. **"Internet speed test guide"** (similarity: 0.51) — Tangentially related to internet performance
4. **"Setting up a new modem"** (similarity: 0.38) — Low relevance, general internet equipment

The top result correctly identifies the most relevant article by matching the semantic meaning ("dropping" ≈ "disconnect", "every few minutes" ≈ "periodically") despite having zero keyword overlap with the query.`,
      annotations: [
        {
          text: "similarity: 0.92",
          note: "Embedding search correctly ranks 'Intermittent connectivity issues' as the top match because 'dropping every few minutes' and 'disconnect periodically' have similar semantic meanings.",
        },
        {
          text: "\"dropping\" ≈ \"disconnect\", \"every few minutes\" ≈ \"periodically\"",
          note: "This illustrates the core value of semantic search: understanding meaning equivalence between different phrasings of the same concept.",
        },
        {
          text: "zero keyword overlap with the query",
          note: "The most relevant result shares no significant keywords with the query — keyword search would rank it last or miss it entirely, while embedding search ranks it first.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** You're building a RAG system for a product documentation site. Given the following user queries and document chunks, do the following:

1. For each query, rank the chunks by likely semantic similarity (most relevant first)
2. Identify which queries would fail with pure keyword search and explain why
3. Suggest one case where keyword search would outperform embedding search

**Queries:**
- Q1: "How do I cancel my subscription?"
- Q2: "error code 504 gateway timeout"
- Q3: "Is there a free tier?"

**Document chunks:**
- A: "To terminate your plan, navigate to Account Settings > Billing and select 'End membership'"
- B: "Our pricing includes a complimentary starter plan with limited features for individual users"
- C: "HTTP 504 errors occur when the upstream server fails to respond within the configured timeout period"
- D: "Refund requests must be submitted within 30 days of the billing date"`,
    starterCode: `## Embedding vs. Keyword Search Analysis

### Semantic similarity rankings

**Q1: "How do I cancel my subscription?"**
1. [most relevant chunk and why]
2. [next most relevant]

**Q2: "error code 504 gateway timeout"**
1. [most relevant chunk and why]
2. [next most relevant]

**Q3: "Is there a free tier?"**
1. [most relevant chunk and why]
2. [next most relevant]

### Where keyword search fails
[Which queries would fail and why]

### Where keyword search wins
[One case where exact matching outperforms semantic search]`,
    hints: [
      "Think about synonyms: 'cancel' and 'terminate', 'subscription' and 'plan/membership'.",
      "Error codes are exact strings — semantic similarity may not help as much here.",
      "'Free tier' and 'complimentary starter plan' mean the same thing but share no keywords.",
      "Consider which chunk each query maps to based on meaning, not word overlap.",
    ],
    validation: [
      {
        type: "min-length",
        value: 350,
        message:
          "Your analysis needs more depth — include rankings for all three queries with explanations.",
      },
      {
        type: "regex",
        value: "[Ss]emantic|[Mm]eaning|[Ss]ynonym|[Ss]imilar",
        message:
          "Explain semantic similarity — why certain chunks match based on meaning, not keywords.",
      },
      {
        type: "regex",
        value: "[Kk]eyword|BM25|[Ee]xact|[Tt]erm|[Ww]ord overlap",
        message:
          "Discuss where keyword search fails and where it outperforms semantic search.",
      },
      {
        type: "regex",
        value: "[Cc]ancel|[Tt]erminat|[Ss]ubscription|[Mm]embership",
        message:
          "Analyze Q1's semantic match between 'cancel subscription' and 'terminate plan/membership'.",
      },
      {
        type: "regex",
        value: "504|[Ee]rror [Cc]ode|[Tt]imeout|[Gg]ateway",
        message:
          "Analyze Q2 and discuss how exact error codes interact with semantic vs. keyword search.",
      },
      {
        type: "regex",
        value: "[Ff]ree|[Cc]omplimentary|[Ss]tarter|[Pp]ricing|[Tt]ier",
        message:
          "Analyze Q3's semantic match between 'free tier' and 'complimentary starter plan'.",
      },
    ],
    sampleSolution: `## Embedding vs. Keyword Search Analysis

### Semantic similarity rankings

**Q1: "How do I cancel my subscription?"**
1. **Chunk A** — "To terminate your plan, navigate to Account Settings > Billing and select 'End membership'" — Highest semantic similarity because "cancel subscription" is semantically equivalent to "terminate plan" and "end membership." All three phrases describe the same action despite sharing no keywords.
2. **Chunk D** — "Refund requests must be submitted within 30 days" — Moderately related, as refunds are conceptually adjacent to cancellation in the billing domain.

**Q2: "error code 504 gateway timeout"**
1. **Chunk C** — "HTTP 504 errors occur when the upstream server fails to respond within the configured timeout period" — Direct match both semantically and by keyword. The chunk explicitly discusses 504 errors and timeout behavior.
2. **Chunk A** — Very low relevance, but "timeout" has a weak conceptual link to "waiting for a response." All other chunks are essentially irrelevant.

**Q3: "Is there a free tier?"**
1. **Chunk B** — "Our pricing includes a complimentary starter plan with limited features for individual users" — Highest semantic similarity because "free tier" and "complimentary starter plan" describe the same concept. The embedding model understands that "free" ≈ "complimentary" and "tier" ≈ "plan."
2. **Chunk D** — Weak connection through the billing/pricing domain, but largely irrelevant to the query.

### Where keyword search fails

**Q1 would fail badly with keyword search.** The query contains "cancel" and "subscription," but the most relevant chunk (A) contains "terminate," "plan," and "membership" instead. Zero keyword overlap means BM25 would likely rank chunk A at the bottom or miss it entirely. Keyword search might surface chunk D (which contains "billing") as the top result, which is not the right answer.

**Q3 would also fail with keyword search.** The query uses "free tier" while the relevant chunk uses "complimentary starter plan." These are synonym pairs ("free" = "complimentary", "tier" = "plan") that keyword search cannot match. The word "free" does not appear anywhere in chunk B.

### Where keyword search wins

**Q2 is the case where keyword search outperforms or matches embedding search.** The query "error code 504 gateway timeout" contains exact technical terms — "504," "gateway," "timeout" — that appear verbatim in chunk C. Keyword search handles this perfectly because the match is literal. In fact, keyword search may be more reliable here: embedding models sometimes treat different error codes (502, 503, 504) as semantically similar, potentially returning chunks about the wrong error code. For exact identifiers, codes, and technical strings, keyword matching is more precise than semantic similarity.`,
  },
};
