# LLearn

An interactive web app for learning LLM implementation patterns through hands-on exercises. Write prompts, get instant structural feedback, and build practical skills — no API keys required.

## Modules

- **Prompt Engineering** — Clear instructions, system prompts, few-shot examples, chain-of-thought, structured output, prompt chaining, and common pitfalls
- **Evaluation Frameworks** — Designing test cases, scoring rubrics, eval-driven iteration, production eval suites, and organizational strategy
- **Agent Frameworks** — Tool design, agent loops, planning and decomposition, error handling, and multi-agent orchestration
- **Retrieval (RAG)** — Chunking strategies, embeddings and vector search, retrieval quality, prompt design for RAG, and pipeline evaluation
- **LLM Implementation Patterns** — Streaming, tool use, multi-turn conversations, error handling and retries, token management, and safety filtering

Each module contains 6–7 lessons with explanations, annotated good/bad examples, and an interactive exercise with validation.

## Getting Started

### Prerequisites

- Node.js 22+ (use `nvm use 22` if needed)

### Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start learning.

### Other commands

```bash
npm run build   # Production build (includes TypeScript checks)
npm run lint    # Run ESLint
npm start       # Serve production build
```

## Tech Stack

Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, CodeMirror
