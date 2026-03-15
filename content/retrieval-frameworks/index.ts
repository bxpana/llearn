import { Module } from "@/lib/types";
import { whyRag } from "./01-why-rag";
import { chunkingStrategies } from "./02-chunking-strategies";
import { embeddingsSearch } from "./03-embeddings-search";
import { retrievalQuality } from "./04-retrieval-quality";
import { ragPromptDesign } from "./05-rag-prompt-design";
import { ragEvaluation } from "./06-rag-evaluation";

export const retrievalFrameworksModule: Module = {
  slug: "retrieval-frameworks",
  title: "Retrieval (RAG)",
  description:
    "Implement retrieval-augmented generation with chunking, embeddings, and search.",
  icon: "🔍",
  lessons: [
    whyRag,
    chunkingStrategies,
    embeddingsSearch,
    retrievalQuality,
    ragPromptDesign,
    ragEvaluation,
  ],
};
