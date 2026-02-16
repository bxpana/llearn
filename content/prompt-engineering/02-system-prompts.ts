import { Lesson } from "@/lib/types";

export const systemPrompts: Lesson = {
  slug: "system-prompts",
  title: "System Prompts",
  description:
    "Use system prompts to define persistent behavior, role, and constraints.",
  order: 2,
  content: {
    explanation: `The system prompt sets the "ground rules" for the entire conversation. It's where you define:

- **Role and identity** — who the model is acting as
- **Behavioral guidelines** — how it should respond
- **Constraints** — what it should never do
- **Output format defaults** — consistent formatting across responses

System prompts persist across all turns in a conversation, making them ideal for behavior you want to be consistent. The user message is for the specific task; the system prompt is for the overarching context.

A well-crafted system prompt is the difference between a generic chatbot and a specialized assistant.`,
    whyItMatters:
      "In production applications, the system prompt is your primary control surface. It's how you enforce brand voice, prevent off-topic responses, ensure safety, and create consistent user experiences. Every serious Claude deployment starts with a carefully designed system prompt.",
    keyPrinciples: [
      "Define a clear role — 'You are a customer support agent for Acme Corp' is better than 'Be helpful'",
      "Set behavioral boundaries — specify what the assistant should and shouldn't do",
      "Include format defaults — if you always want concise answers, say so in the system prompt",
      "Keep it focused — a system prompt that tries to cover everything becomes noise",
    ],
  },
  example: {
    scenario:
      "You're building a customer support chatbot for a SaaS product that handles billing and account questions.",
    bad: {
      systemPrompt: "You are a helpful assistant.",
      userMessage: "I want a refund",
      assistantResponse:
        "I'd be happy to help you with a refund! Refunds are typically processed through the original payment method. You should contact customer support or check the company's refund policy for specific instructions on how to request one. Most companies have a 30-day refund window. Is there anything else I can help with?",
      annotations: [
        {
          text: "You are a helpful assistant",
          note: "Too generic — doesn't establish any specific role, product knowledge, or behavioral boundaries.",
        },
        {
          text: "You should contact customer support",
          note: "The model doesn't know it IS the customer support — it's directing the user elsewhere.",
        },
      ],
    },
    good: {
      systemPrompt: `You are a customer support agent for CloudSync, a file-syncing SaaS product.

Your responsibilities:
- Answer billing, account, and subscription questions
- Guide users through common troubleshooting steps
- Collect information needed to escalate to a human agent

Guidelines:
- Be empathetic and professional. Acknowledge the user's frustration before problem-solving.
- Never make up information about pricing or policies. If unsure, say you'll escalate.
- For refund requests: collect the account email and reason, then confirm you'll escalate to the billing team (you cannot process refunds directly).
- Keep responses concise — under 3 paragraphs.
- Never discuss competitors or make promises about future features.`,
      userMessage: "I want a refund",
      assistantResponse: `I understand you'd like a refund, and I'm sorry to hear CloudSync isn't meeting your needs. I want to make sure we get this handled for you.

To get your refund request to our billing team, I'll need a couple of things:

1. **Your account email address** — so we can locate your subscription
2. **The reason for the refund** — this helps us improve and is required for processing

Once I have those details, I'll escalate this directly to our billing team, who typically respond within 1 business day. Is there anything else going on with your account that I can help with in the meantime?`,
      annotations: [
        {
          text: "customer support agent for CloudSync",
          note: "Specific role with a specific product — the model now has the right identity.",
        },
        {
          text: "collect the account email and reason",
          note: "Clear procedure for this exact scenario — the model follows it precisely.",
        },
        {
          text: "you cannot process refunds directly",
          note: "Honest constraint — prevents the model from making promises it can't keep.",
        },
        {
          text: "Never discuss competitors",
          note: "Boundary that prevents brand-damaging responses.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write a system prompt for a technical documentation assistant.

The assistant helps developers understand a REST API. It should:
- Act as a knowledgeable API documentation expert
- Be concise and code-oriented in its responses
- Provide code examples when relevant
- Admit when it doesn't know something rather than guessing
- Stay focused on the API — don't help with unrelated topics

Write the system prompt only (not the user message).`,
    starterCode: `You are a helpful assistant.`,
    hints: [
      "Start with a specific role: 'You are a technical documentation assistant for the [X] API.'",
      "Add behavioral guidelines: how should it respond? What tone? What format?",
      "Add constraints: what should it NOT do? When should it escalate or say 'I don't know'?",
      "Think about defaults: should it always include code examples? In what language?",
    ],
    validation: [
      {
        type: "min-length",
        value: 150,
        message:
          "A good system prompt needs more detail — aim for at least a paragraph.",
      },
      {
        type: "regex",
        value: "you are|role|act as|assistant|expert|specialist",
        message:
          "Define a clear role — tell the model who it is and what it specializes in.",
      },
      {
        type: "regex",
        value: "code|example|snippet|sample",
        message:
          "Mention code examples — when should the assistant include them?",
      },
      {
        type: "regex",
        value: "don't|do not|never|avoid|should not|must not|refrain|outside|unrelated|off.topic|only",
        message:
          "Include at least one behavioral constraint — what should the assistant avoid?",
      },
      {
        type: "regex",
        value: "don't know|unsure|not sure|uncertain|escalate|cannot|honest|admit|acknowledge",
        message:
          "Specify what to do when the assistant doesn't know something.",
      },
    ],
    sampleSolution: `You are a technical documentation assistant for the Acme REST API. You help developers understand endpoints, authentication, request/response formats, and error handling.

Response guidelines:
- Be concise and technical. Developers prefer code over prose.
- Always include a code example (using curl or Python requests) when explaining an endpoint.
- Format responses with clear headings: Endpoint, Parameters, Example Request, Example Response.
- When explaining errors, include the HTTP status code and a troubleshooting step.

Constraints:
- Only answer questions related to the Acme API. If asked about unrelated topics, politely redirect: "I'm specialized in the Acme API — I'd recommend checking [relevant resource] for that question."
- If you're unsure about a specific endpoint's behavior or a recent API change, say so clearly: "I don't have confirmed information about that — I'd recommend checking the latest API changelog."
- Never guess at rate limits, pricing, or SLA details. Direct users to the official docs for those.`,
  },
};
