import { Lesson } from "@/lib/types";

export const chunkingStrategies: Lesson = {
  slug: "chunking-strategies",
  title: "Chunking Strategies",
  description:
    "Understand why documents must be chunked for retrieval and the tradeoffs between different chunking approaches.",
  order: 2,
  content: {
    explanation: `Before you can retrieve relevant information from a document, you need to break it into smaller pieces called **chunks**. Chunking is necessary because embedding models have token limits, LLM context windows are finite, and smaller, focused chunks produce more precise retrieval results than entire documents.

**Why not embed whole documents?** Two reasons. First, embedding models (like text-embedding-3-small) have input limits — typically 512 to 8,192 tokens. A 50-page document won't fit. Second, even if it did, the resulting embedding would be a blurry average of everything in the document. A query about "parental leave" would get a weak match against a document that mentions parental leave in one paragraph among hundreds of unrelated paragraphs.

**Fixed-size chunking** is the simplest approach: split text every N characters or tokens, regardless of content structure. It's easy to implement and produces predictable chunk sizes. However, it frequently breaks mid-sentence or mid-paragraph, splitting a coherent thought across two chunks. This means retrieval might return half of an important paragraph while missing the other half.

**Semantic chunking** uses natural language boundaries — sentences, paragraphs, or topic shifts — to determine where to split. The idea is that each chunk should contain a complete thought. Some implementations use embedding similarity: they compute embeddings for each sentence and split where consecutive sentences are semantically dissimilar (indicating a topic change). This preserves meaning better but produces variable-length chunks.

**Structural chunking** leverages the document's own structure — headings, sections, subsections, list items, code blocks, or HTML/Markdown formatting. For well-structured documents (technical docs, legal contracts, handbooks), this is often the best approach because the document author already defined logical boundaries. You split at section headers, keeping each section as a chunk (or further subdividing large sections).

**The size tradeoff is critical:**

- **Too small** (50-100 tokens) — each chunk lacks context. A retrieval match might return "Employees are eligible after 6 months" without explaining what they're eligible for.
- **Too large** (2,000+ tokens) — chunks contain mixed topics, diluting relevance. A query about "vacation policy" might match a chunk that's 80% about health insurance and 20% about vacation.
- **Sweet spot** — typically 200-800 tokens depending on the domain and document structure. Experimentation is required.

**Overlap** is a technique where consecutive chunks share some text (e.g., 50-100 tokens of overlap). This prevents information loss at chunk boundaries. If a key fact spans two chunks, overlap ensures it appears completely in at least one chunk. A typical overlap is 10-20% of the chunk size.

**Metadata preservation** is often overlooked but essential. Each chunk should carry metadata from its source: document title, section heading, page number, last-updated date, access permissions, and document type. This metadata enables filtering during retrieval (e.g., "only search engineering docs") and helps the LLM cite sources accurately. Without metadata, you lose track of where each chunk came from, making source attribution impossible.

**Practical recommendations:**

- Start with structural chunking if your documents have clear formatting
- Add overlap (10-20%) to prevent boundary information loss
- Attach metadata to every chunk at indexing time
- Test retrieval quality with real queries and adjust chunk sizes based on results
- Consider different strategies for different document types in the same pipeline`,
    whyItMatters:
      "Chunking quality directly determines retrieval quality, which determines the quality of the final RAG output. Poor chunking is the most common source of RAG failures — either retrieving irrelevant content because chunks are too large, or missing critical context because chunks are too small. Getting chunking right is the foundation of an effective RAG system.",
    keyPrinciples: [
      "Fixed-size chunking is simple but breaks semantic boundaries; structural and semantic chunking preserve meaning at the cost of complexity.",
      "Chunk size involves a tradeoff: too small loses context, too large dilutes relevance — aim for 200-800 tokens and test with real queries.",
      "Overlap between consecutive chunks (10-20%) prevents information loss at chunk boundaries where important content may be split.",
      "Every chunk should carry metadata (source document, section, date) to enable filtered retrieval and accurate source attribution.",
    ],
  },
  example: {
    scenario:
      "A legal tech company needs to chunk employment contracts so that specific clauses can be retrieved when employees ask questions about their agreements.",
    bad: {
      userMessage: `Chunk this employment contract for our RAG pipeline. Use 500-character fixed chunks.

Document: "EMPLOYMENT AGREEMENT — Section 4: Compensation. 4.1 Base Salary. Employee shall receive an annual base salary of $120,000, payable in bi-weekly installments. 4.2 Performance Bonus. Employee is eligible for an annual performance bonus of up to 15% of base salary, subject to achieving performance targets set by the direct manager. Bonus decisions are made in Q1 of the following year. 4.3 Equity. Employee shall receive a stock option grant of 10,000 shares, vesting over 4 years with a 1-year cliff..."`,
      assistantResponse: `Chunk 1 (chars 0-500):
"EMPLOYMENT AGREEMENT — Section 4: Compensation. 4.1 Base Salary. Employee shall receive an annual base salary of $120,000, payable in bi-weekly installments. 4.2 Performance Bonus. Employee is eligible for an annual performance bonus of up to 15% of base salary, subject to achieving performance targets set by the direct manager. Bonus decisions are made in Q1 of the following year. 4.3 Equity. Employee shall receive a stock option grant of 10,000 shares, vesting over 4 ye"

Chunk 2 (chars 500-...):
"ars with a 1-year cliff..."`,
      annotations: [
        {
          text: "chars 0-500",
          note: "Fixed-size splitting ignores the document's natural structure. All three clauses (salary, bonus, equity) are jammed into one chunk, making retrieval imprecise.",
        },
        {
          text: "vesting over 4 ye",
          note: "The chunk boundary cuts mid-word ('years' becomes 'ye' and 'ars'), destroying the equity vesting information. A query about vesting would get a broken answer.",
        },
        {
          text: "Chunk 2 (chars 500-...)",
          note: "No metadata is preserved — which contract, which employee, which section. Without this, you can't filter results or cite sources.",
        },
      ],
    },
    good: {
      userMessage: `Chunk this employment contract for our RAG pipeline. Design a strategy that preserves clause boundaries and metadata.

Document: "EMPLOYMENT AGREEMENT — Section 4: Compensation. 4.1 Base Salary. Employee shall receive an annual base salary of $120,000, payable in bi-weekly installments. 4.2 Performance Bonus. Employee is eligible for an annual performance bonus of up to 15% of base salary, subject to achieving performance targets set by the direct manager. Bonus decisions are made in Q1 of the following year. 4.3 Equity. Employee shall receive a stock option grant of 10,000 shares, vesting over 4 years with a 1-year cliff..."`,
      assistantResponse: `**Chunking strategy:** Structural chunking by clause (split at section numbers like "4.1", "4.2", "4.3"), with parent section context prepended.

**Chunk 1:**
\`\`\`
Section: 4. Compensation > 4.1 Base Salary
Content: "Employee shall receive an annual base salary of $120,000, payable in bi-weekly installments."
Metadata: { document: "Employment Agreement", section: "4.1", topic: "Base Salary", parent: "Compensation" }
\`\`\`

**Chunk 2:**
\`\`\`
Section: 4. Compensation > 4.2 Performance Bonus
Content: "Employee is eligible for an annual performance bonus of up to 15% of base salary, subject to achieving performance targets set by the direct manager. Bonus decisions are made in Q1 of the following year."
Metadata: { document: "Employment Agreement", section: "4.2", topic: "Performance Bonus", parent: "Compensation" }
\`\`\`

**Chunk 3:**
\`\`\`
Section: 4. Compensation > 4.3 Equity
Content: "Employee shall receive a stock option grant of 10,000 shares, vesting over 4 years with a 1-year cliff."
Metadata: { document: "Employment Agreement", section: "4.3", topic: "Equity", parent: "Compensation" }
\`\`\`

Each chunk contains one complete clause, preserving semantic boundaries. The parent section header ("Compensation") is prepended for context. Metadata enables filtering by section or topic.`,
      annotations: [
        {
          text: "Structural chunking by clause",
          note: "Using the contract's own structure (numbered clauses) as chunk boundaries ensures each chunk contains one complete, coherent topic.",
        },
        {
          text: "Section: 4. Compensation > 4.1 Base Salary",
          note: "Prepending the parent section provides context — the chunk about '$120,000' clearly relates to 'Compensation > Base Salary', not some other dollar figure.",
        },
        {
          text: "Metadata: { document: \"Employment Agreement\"",
          note: "Rich metadata on every chunk enables filtered search ('show only equity clauses') and accurate citation in the final response.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design a chunking strategy for an employee handbook that contains the following sections:

- Chapter 1: Company Overview (2 pages)
- Chapter 2: Code of Conduct (5 pages, with numbered sub-sections)
- Chapter 3: Benefits (8 pages, with sub-sections for Health, Dental, Vision, 401k, PTO)
- Chapter 4: IT & Security Policies (3 pages, with numbered procedures)
- Appendix A: Forms and Templates (10 pages of form images and tables)

Your strategy must address:
1. What chunking approach you'll use and why
2. How you'll handle different section types (narrative text vs. forms/tables)
3. What chunk size range you're targeting and why
4. How you'll use overlap
5. What metadata you'll attach to each chunk`,
    starterCode: `## Chunking Strategy: Employee Handbook

### Approach
[Which chunking method and why]

### Handling different content types
- **Narrative sections (Ch 1-4):** [strategy]
- **Forms and tables (Appendix A):** [strategy]

### Chunk size
[Target range and reasoning]

### Overlap strategy
[How much overlap and why]

### Metadata schema
[What metadata each chunk carries]`,
    hints: [
      "Structural chunking works well here because the handbook has clear section headings.",
      "Forms and tables may need different treatment — consider summarizing them or chunking by individual form.",
      "Different chapters have different lengths; your strategy should handle both 2-page and 8-page chapters.",
      "Think about what metadata would help users filter results (e.g., 'show only benefits-related chunks').",
    ],
    validation: [
      {
        type: "min-length",
        value: 400,
        message:
          "Your chunking strategy needs more detail — address all five required sections.",
      },
      {
        type: "regex",
        value: "[Ss]tructural|[Ss]emantic|[Ss]ection|[Hh]eading|[Ss]ub.?section",
        message:
          "Specify a chunking approach — structural, semantic, or fixed-size — and explain your choice.",
      },
      {
        type: "regex",
        value: "[Ff]orm|[Tt]able|[Aa]ppendix|[Ii]mage",
        message:
          "Address how you'll handle non-narrative content like forms, tables, and images in Appendix A.",
      },
      {
        type: "regex",
        value: "[Oo]verlap|[Bb]oundary|[Ss]hare",
        message:
          "Describe your overlap strategy to prevent information loss at chunk boundaries.",
      },
      {
        type: "regex",
        value: "[Mm]etadata|[Ss]ource|[Cc]hapter|[Ss]ection|[Tt]itle|[Tt]opic",
        message:
          "Define the metadata schema — what information each chunk carries for filtering and attribution.",
      },
    ],
    sampleSolution: `## Chunking Strategy: Employee Handbook

### Approach

I'll use **structural chunking** based on the handbook's existing section hierarchy. The handbook has clear chapters and sub-sections, making structural boundaries the natural choice. Each sub-section becomes one chunk, with the parent chapter title prepended for context. For chapters without sub-sections (like Chapter 1: Company Overview), I'll chunk by paragraph or natural breaks at approximately 400-600 tokens.

This approach is better than fixed-size chunking because it preserves the author's intended logical groupings. A query about "401k matching" should return the complete 401k sub-section, not half of the PTO section and half of the 401k section.

### Handling different content types

- **Narrative sections (Ch 1-4):** Chunk by sub-section (e.g., "3.1 Health Insurance" is one chunk). If a sub-section exceeds 800 tokens, split at paragraph boundaries within the sub-section, keeping the sub-section header on each resulting chunk. Short sub-sections (under 100 tokens) are merged with the next sub-section to avoid tiny, context-poor chunks.

- **Forms and tables (Appendix A):** Forms and tables are handled differently. Each form becomes its own chunk with a text summary (e.g., "PTO Request Form — fields: employee name, dates, manager approval, reason for leave"). Tables are converted to structured text. Images of forms are excluded from embedding but referenced in metadata so the response can link to the original document. This ensures the retrieval system can match queries like "where is the PTO request form" even though the form itself isn't embedded.

### Chunk size

Target range: **200-600 tokens per chunk**. This range is based on the document type:
- Short sub-sections (procedures, policy clauses): ~200-300 tokens — small enough for precise retrieval
- Longer narrative sub-sections (benefits descriptions): ~400-600 tokens — large enough to preserve complete explanations
- Maximum hard limit: 800 tokens — any chunk exceeding this gets split at paragraph boundaries

This range balances precision (chunks are focused enough to match specific queries) with completeness (chunks contain enough context to be useful without surrounding text).

### Overlap strategy

I'll use **50-token overlap** (approximately 10-15% of average chunk size) between consecutive chunks within the same section. Overlap is applied at the paragraph level — the last paragraph of chunk N is repeated as the first paragraph of chunk N+1. This prevents information loss when a key detail spans a chunk boundary. Overlap is NOT applied between different sections, since section boundaries are natural topic shifts where cross-boundary information loss is unlikely.

### Metadata schema

Each chunk carries the following metadata:

- **document_title**: "Employee Handbook v2024"
- **chapter**: "Chapter 3: Benefits"
- **section**: "3.4 401k Retirement Plan"
- **content_type**: "narrative" | "form" | "table" | "procedure"
- **page_range**: "pp. 12-13"
- **last_updated**: "2024-01-15"
- **access_level**: "all-employees" (for future access control)
- **keywords**: ["401k", "retirement", "matching", "vesting"] (extracted key terms for hybrid search)

This metadata enables filtered retrieval (e.g., "search only Benefits chapter"), accurate source citation, and freshness checks.`,
  },
};
