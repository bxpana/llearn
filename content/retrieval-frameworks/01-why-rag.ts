import { Lesson } from "@/lib/types";

export const whyRag: Lesson = {
  slug: "why-rag",
  title: "Why RAG",
  description:
    "Understand the problem RAG solves and when it's the right approach over alternatives like fine-tuning or long context.",
  order: 1,
  content: {
    explanation: `Retrieval-Augmented Generation (RAG) solves a fundamental limitation of large language models: **they don't know your private data**. An LLM's training data has a cutoff date and never includes your internal documents, policies, codebases, or customer records. When you ask about information it doesn't have, it either refuses to answer or — worse — confidently generates plausible-sounding but incorrect information (hallucination).

**The core idea behind RAG** is simple: before generating a response, retrieve relevant documents from your own data sources and include them in the prompt as context. The pipeline has three stages:

1. **Retrieve** — Given a user query, search your document store for the most relevant chunks of text. This typically uses vector similarity search, keyword search, or a hybrid of both.
2. **Augment** — Insert the retrieved chunks into the LLM prompt, usually in a structured format with source labels and instructions for how to use the context.
3. **Generate** — The LLM produces a response grounded in the retrieved context rather than relying solely on its training data.

**Why not just fine-tune?** Fine-tuning bakes knowledge into model weights. This works for teaching a model a new style or task format, but it's a poor fit for factual knowledge that changes frequently. Fine-tuning is expensive, slow to update, and can cause the model to hallucinate "remembered" facts that were slightly different in training. RAG keeps your data external and always up-to-date — you update the document store, not the model.

**Why not just use long context windows?** Modern models support 100K+ token contexts, so why not dump all your documents in? Three reasons:

- **Cost and latency** — sending 100K tokens per request is expensive and slow
- **Lost in the middle** — models struggle to attend to information buried in very long contexts, especially in the middle of the window
- **Scale limits** — most organizations have far more data than fits in any context window

**When RAG is the right choice:**

- Your data changes frequently (policies, documentation, product catalogs)
- You need **source attribution** — users want to know where the answer came from
- Your knowledge base is large (thousands of documents or more)
- You need to control access — different users see different documents
- Accuracy matters more than creative generation

**When RAG may not be the right choice:**

- The task is about style or format, not factual knowledge (use fine-tuning)
- Your entire knowledge base fits in a single context window and rarely changes
- You need real-time information that isn't in any document store (use tool calling / web search)

Understanding these tradeoffs is critical before investing in a RAG pipeline. RAG adds complexity — chunking, embedding, indexing, retrieval, prompt engineering — so you should be confident it's the right architecture for your use case.`,
    whyItMatters:
      "RAG is the most common architecture for production LLM applications that need to work with private or frequently-updated data. Choosing RAG when it's the right fit — and avoiding it when it's not — saves teams months of development time. As a practitioner, being able to articulate why RAG beats alternatives for a given use case is essential for sound system design.",
    keyPrinciples: [
      "RAG solves the problem of LLMs not having access to private, recent, or domain-specific data by retrieving relevant context at query time.",
      "The RAG pipeline has three stages: retrieve relevant documents, augment the prompt with retrieved context, and generate a grounded response.",
      "Fine-tuning is better for teaching style and format, while RAG is better for factual knowledge that changes over time.",
      "RAG adds architectural complexity, so validate that your use case actually requires it before committing to the approach.",
    ],
  },
  example: {
    scenario:
      "A company wants to build an internal chatbot that answers employee questions about HR policies, benefits, and company procedures.",
    bad: {
      userMessage: `What is our company's parental leave policy?`,
      assistantResponse: `Based on common industry standards, most companies offer 12 weeks of parental leave. Typically, the first 6 weeks are fully paid, and the remaining 6 weeks are at 60% pay. You should check with your HR department for the specific details of your company's policy.

Additionally, under the Family and Medical Leave Act (FMLA), eligible employees are entitled to up to 12 weeks of unpaid, job-protected leave for family and medical reasons.`,
      annotations: [
        {
          text: "Based on common industry standards",
          note: "The LLM has no access to this company's actual policies, so it falls back on generic information — which may be completely wrong for this organization.",
        },
        {
          text: "most companies offer 12 weeks",
          note: "This is a hallucinated 'fact' presented with confidence. The actual company policy could be 8 weeks, 16 weeks, or something entirely different.",
        },
        {
          text: "You should check with your HR department",
          note: "The model knows it doesn't have the real answer, but instead of refusing, it gives generic advice — defeating the purpose of the chatbot entirely.",
        },
      ],
    },
    good: {
      systemPrompt: `You are an HR assistant for Acme Corp. Answer employee questions using ONLY the provided context documents. If the context doesn't contain enough information to answer, say "I don't have that information — please contact hr@acme.com." Always cite the source document.`,
      userMessage: `What is our company's parental leave policy?

<context>
<source document="Acme Corp Employee Handbook v2024, Section 7.3 — Parental Leave">
All full-time employees who have been with the company for at least 6 months are eligible for parental leave. Birth parents receive 16 weeks of fully-paid leave. Non-birth parents receive 8 weeks of fully-paid leave. An additional 4 weeks of unpaid leave may be requested with manager approval. Leave must begin within 30 days of the birth or adoption date.
</source>
</context>`,
      assistantResponse: `According to the **Acme Corp Employee Handbook (Section 7.3)**:

- **Birth parents**: 16 weeks of fully-paid leave
- **Non-birth parents**: 8 weeks of fully-paid leave
- **Additional unpaid leave**: Up to 4 weeks with manager approval
- **Eligibility**: Full-time employees with at least 6 months of tenure
- **Timing**: Leave must begin within 30 days of the birth or adoption date

If you have additional questions about your specific situation, contact hr@acme.com.`,
      annotations: [
        {
          text: "source document=\"Acme Corp Employee Handbook v2024, Section 7.3\"",
          note: "The RAG pipeline retrieved the specific relevant section and included it with a clear source label, so the model can cite its source.",
        },
        {
          text: "According to the Acme Corp Employee Handbook (Section 7.3)",
          note: "The response cites the exact source document, giving employees confidence the answer is authoritative and verifiable.",
        },
        {
          text: "16 weeks of fully-paid leave",
          note: "The answer uses the company's actual policy numbers, not generic industry averages — this is the core value RAG provides.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** A startup wants to build a Q&A system for their internal knowledge base (engineering docs, HR policies, product specs). They're debating between three approaches: fine-tuning, long context window, or RAG.

Write an analysis that:
1. Explains why RAG is the most appropriate approach for this use case
2. Identifies at least 2 specific reasons fine-tuning is a poor fit
3. Identifies at least 1 limitation of relying on long context alone
4. Sketches the RAG pipeline components (retrieve, augment, generate) with specifics for this use case`,
    starterCode: `## Approach Analysis: Internal Knowledge Base Q&A

### Why RAG is the right approach
[Explain why RAG fits this use case]

### Why fine-tuning is not ideal
[Give at least 2 specific reasons]

### Limitations of long context alone
[Identify at least 1 problem]

### RAG Pipeline Design
- **Retrieve:** [how documents are found]
- **Augment:** [how context is structured in the prompt]
- **Generate:** [how the LLM produces the answer]`,
    hints: [
      "Think about how often internal docs change — engineering docs and policies are updated regularly.",
      "Consider the total volume of documents — can they all fit in a context window?",
      "Fine-tuning struggles with factual recall and can't be updated quickly when policies change.",
      "For the pipeline sketch, think about what document types need different chunking or retrieval strategies.",
    ],
    validation: [
      {
        type: "min-length",
        value: 400,
        message:
          "Your analysis needs more depth — expand on each section with specific reasoning.",
      },
      {
        type: "regex",
        value: "[Rr]etriev(e|al)|[Aa]ugment|[Gg]enerat(e|ion)",
        message:
          "Describe all three stages of the RAG pipeline: retrieve, augment, and generate.",
      },
      {
        type: "regex",
        value: "[Ff]ine.?tun(e|ing)",
        message:
          "Explain why fine-tuning is not ideal for this use case.",
      },
      {
        type: "regex",
        value: "[Cc]ontext [Ww]indow|[Ll]ong [Cc]ontext|token",
        message:
          "Address the limitations of relying on long context windows alone.",
      },
      {
        type: "regex",
        value: "[Uu]pdat(e|ed|ing)|[Cc]hang(e|es|ing)|[Ff]requent",
        message:
          "Mention that internal documents change frequently, making RAG's external data store advantageous.",
      },
      {
        type: "regex",
        value: "[Cc]hunk|[Ee]mbed|[Vv]ector|[Ss]earch|[Ii]ndex",
        message:
          "Include specific pipeline components like chunking, embedding, or vector search in your design.",
      },
    ],
    sampleSolution: `## Approach Analysis: Internal Knowledge Base Q&A

### Why RAG is the right approach

RAG is the best fit for an internal knowledge base Q&A system because the core requirement is answering questions grounded in private, frequently-updated documents. RAG keeps the knowledge external to the model, meaning you can update engineering docs, HR policies, and product specs without retraining or fine-tuning anything. The retrieval step ensures the model only sees relevant context, keeping responses focused and accurate. RAG also enables source attribution — employees can verify answers by checking the cited document, which builds trust in the system.

### Why fine-tuning is not ideal

1. **Frequent updates are expensive**: Internal docs change constantly — new engineering standards, updated policies, revised product specs. Fine-tuning requires retraining the model each time knowledge changes, which is slow and costly. RAG just requires updating the document index.
2. **Factual hallucination risk**: Fine-tuned models "memorize" facts into weights, but this memorization is imprecise. The model might generate a policy detail that was almost-but-not-quite what the training data said, leading to confidently wrong answers with no way to verify the source.

### Limitations of long context alone

Even with 100K+ token context windows, the entire internal knowledge base likely contains millions of tokens across hundreds of documents. You can't fit it all in one context window. Additionally, research shows models suffer from "lost in the middle" effects — information buried in long contexts is often ignored. The cost and latency of sending massive contexts for every query also makes this approach impractical at scale.

### RAG Pipeline Design

- **Retrieve:** Documents are chunked by section (engineering docs by heading, policies by clause, product specs by feature). Each chunk is embedded using a model like text-embedding-3-small and stored in a vector database. At query time, the user question is embedded and the top-5 most similar chunks are retrieved using cosine similarity search. A hybrid approach combining vector search with keyword matching (BM25) handles cases where exact terminology matters.
- **Augment:** Retrieved chunks are inserted into the prompt with XML-style source tags (e.g., \`<source document="Engineering Standards v3, Section 4.2">\`). The system prompt instructs the model to only use provided context, cite sources, and say "I don't have that information" when context is insufficient.
- **Generate:** The LLM generates a response grounded in the retrieved context, with citations to specific source documents. The response format includes a direct answer followed by the source reference, so employees can verify the information independently.`,
  },
};
