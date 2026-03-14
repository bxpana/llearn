import { Lesson } from "@/lib/types";

export const multiTurn: Lesson = {
  slug: "multi-turn",
  title: "Multi-Turn Conversation Design",
  description:
    "Learn how to manage conversation history, handle context window limits, and design robust multi-turn experiences.",
  order: 3,
  content: {
    explanation: `Multi-turn conversations are the backbone of most LLM-powered applications — chatbots, assistants, and interactive tools all maintain a running history of messages. Getting this right requires understanding how context windows work, when to trim or summarize history, and how to keep system prompts stable across long conversations.

**Managing Conversation History**

Every message in a conversation consumes tokens from the context window. A typical multi-turn exchange includes the system prompt, all prior user and assistant messages, and any tool call results. As conversations grow, you approach the model's context limit. The naive approach of "append everything" works for short conversations but fails as history accumulates.

**Context Window Limits and Truncation**

Every model has a maximum context window (e.g., 128k, 200k tokens). When your conversation history approaches this limit, you must reduce its size. Truncation strategies include:

- **Sliding window** — keep the last N messages and drop the oldest. Simple but loses early context that might be important.
- **Token-based truncation** — remove the oldest messages until total tokens are under a budget. More precise than message count.
- **Selective pruning** — remove tool call results and intermediate reasoning, keeping user questions and final answers. Preserves the most useful context.

**System Prompt Stability**

The system prompt should remain constant and always appear first in the message array. Never let growing conversation history push the system prompt out of the context window — this causes dramatic behavior changes. Pin the system prompt by always reserving tokens for it and counting it separately from the conversation budget.

**Summarizing Prior Context**

For long conversations, summarization is more effective than simple truncation. Periodically:

1. Take the oldest portion of the conversation
2. Ask the model to summarize it into a concise context block
3. Replace the original messages with the summary

This preserves key information (user preferences, decisions made, facts established) while dramatically reducing token count. The summary becomes a "compressed memory" that the model can reference.

**When to Reset vs. Continue**

Not every interaction should be part of the same conversation. Consider resetting when:

- The user switches to a completely different topic
- An error state corrupts the conversation history
- The conversation has exceeded a quality threshold (very long conversations tend to degrade in coherence)
- The user explicitly wants a fresh start

Provide clear UX for starting new conversations versus continuing existing ones. Some applications benefit from a hybrid approach: maintain a persistent user profile (preferences, past decisions) that's injected as context, while resetting the conversation history itself.

**Message Role Management**

Ensure the message array maintains valid role alternation (user/assistant/user/assistant). Injecting system information mid-conversation should use the system or developer role, not the user role — otherwise the model may confuse system instructions with user requests. Tool results should use the dedicated tool role, keeping the role sequence clean and predictable.`,
    whyItMatters:
      "Most LLM applications are multi-turn by nature. Without deliberate conversation management, applications hit context limits, lose important early context, or degrade in quality over long sessions. Well-designed conversation history management is the difference between a chatbot that works for 5 messages and one that works for 500.",
    keyPrinciples: [
      "Always pin the system prompt at the start and reserve a fixed token budget for it so growing history never displaces instructions",
      "Use summarization over simple truncation to compress old conversation segments while preserving key facts and decisions",
      "Set a token budget for conversation history (e.g., 60% of context window) and enforce it before every API call",
      "Reset conversations when topic shifts dramatically or quality degrades rather than forcing a single infinite thread",
    ],
  },
  example: {
    scenario:
      "A support chatbot has been in a conversation with a user for 45 messages. The context window is 100k tokens and the conversation is approaching 80k tokens.",
    bad: {
      systemPrompt: "You are a helpful customer support agent for TechCo.",
      userMessage: `[Message 46] Can you check my refund status? My order was #12345.`,
      assistantResponse: `I apologize, but I'm having trouble processing your request. Could you remind me what we've been discussing?

[Internal state: 82,000 of 100,000 tokens used]
[System prompt pushed to position 47 in message array]
[Earlier context about the user's account, preferences, and issue history is intact but the model is struggling with coherence]

Actually, I see you mentioned order #12345. Let me look into that. However, I want to confirm — are you the same customer who was asking about the billing issue earlier, or is this a new topic?

[The model is confused because it's trying to attend to 45 prior messages spanning multiple topics without any summarization or pruning]`,
      annotations: [
        {
          text: "Could you remind me what we've been discussing?",
          note: "The model is losing coherence because it has too much context to attend to effectively. Raw message count doesn't equal useful context.",
        },
        {
          text: "82,000 of 100,000 tokens used",
          note: "No token budget management. The system is close to the limit with no strategy for what happens when it's exceeded — the next few messages will cause a hard failure.",
        },
        {
          text: "are you the same customer who was asking about the billing issue earlier",
          note: "Without summarization, the model conflates topics from different parts of the conversation. It has all the history but can't use it effectively.",
        },
      ],
    },
    good: {
      systemPrompt: `You are a helpful customer support agent for TechCo.

[Conversation summary — auto-generated at message 40]:
- Customer: Jane D., account #98765, premium plan
- Issue 1 (resolved): Billing discrepancy on March invoice — credited $45
- Issue 2 (resolved): Password reset completed successfully
- Current topic: Waiting for refund on order #12345 (requested 5 days ago)
- Tone: Friendly but wants quick resolution`,
      userMessage: `[Message 46] Can you check my refund status? My order was #12345.`,
      assistantResponse: `Of course, Jane! I can see you requested a refund for order #12345 five days ago. Let me check the current status.

[Tool call: check_refund_status(order_id: "12345")]

Your refund of $89.99 for order #12345 was processed yesterday and should appear in your account within 2-3 business days. Is there anything else I can help with?

[Internal state: 12,000 of 100,000 tokens used]
[System prompt pinned at position 0]
[Messages 1-40 replaced with 500-token summary]
[Messages 41-46 kept in full]`,
      annotations: [
        {
          text: "Conversation summary — auto-generated at message 40",
          note: "Messages 1-40 were summarized into a compact context block injected into the system prompt. This preserves key facts (customer name, resolved issues, current topic) while reducing 70k tokens to 500.",
        },
        {
          text: "Of course, Jane!",
          note: "The model has full context about who the customer is and what they need — from the summary, not from scanning 45 raw messages. Response quality is higher despite using far fewer tokens.",
        },
        {
          text: "12,000 of 100,000 tokens used",
          note: "Token usage is well within budget after summarization. There's room for many more turns before the next summarization pass is needed.",
        },
        {
          text: "Messages 1-40 replaced with 500-token summary",
          note: "The sliding window keeps recent messages in full for detailed context, while older messages are compressed. This balances recency with historical awareness.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design a conversation management strategy for a customer support chatbot with a 100k token context window.

Your design must address:
- **Token budget allocation** — how you divide the 100k context window across system prompt, conversation summary, recent messages, and a safety buffer
- **Summarization strategy** — when to trigger summarization, what to include, and how to inject the summary
- **Conversation reset criteria** — when to start a fresh conversation vs. continue the existing one
- **Message role handling** — how to maintain clean role alternation and handle injected system context

Write a detailed technical specification with concrete numbers (token counts, thresholds, message counts).`,
    starterCode: `## Conversation Management Specification

### Token Budget Allocation
[How you divide the 100k token context window]

### Summarization Strategy
[When and how to summarize conversation history]

### Conversation Reset Criteria
[When to start fresh vs. continue]

### Message Role Handling
[How to maintain clean message structure]`,
    hints: [
      "A common allocation: 10% system prompt, 20% summary, 50% recent messages, 20% safety buffer for the response.",
      "Trigger summarization when recent messages exceed their token budget, not at a fixed message count.",
      "Include user identity, resolved topics, current topic, and user preferences in your summary template.",
      "Consider what happens when the summary itself grows too long over very long conversations.",
    ],
    validation: [
      {
        type: "min-length",
        value: 400,
        message:
          "Your specification needs more detail — include concrete token counts and thresholds for each section.",
      },
      {
        type: "regex",
        value: "[Tt]oken|[Cc]ontext [Ww]indow|100k|100,000",
        message:
          "Reference the context window size and include token-based budgets in your allocation.",
      },
      {
        type: "regex",
        value: "[Ss]ummar(y|ize|ization)",
        message:
          "Include a summarization strategy for compressing older conversation history.",
      },
      {
        type: "regex",
        value: "[Rr]eset|[Ff]resh|[Nn]ew [Cc]onversation|[Cc]lear",
        message:
          "Define when to reset the conversation vs. continue the current one.",
      },
      {
        type: "regex",
        value: "[Ss]ystem [Pp]rompt|[Pp]in|[Rr]eserv(e|ed)",
        message:
          "Address how the system prompt is pinned and protected from being pushed out by growing history.",
      },
      {
        type: "regex",
        value: "[Bb]uffer|[Ss]afety|[Rr]esponse|[Oo]utput",
        message:
          "Reserve token budget for the model's response output (safety buffer).",
      },
    ],
    sampleSolution: `## Conversation Management Specification

### Token Budget Allocation

Total context window: 100,000 tokens. Allocated as follows:

| Segment | Token Budget | Percentage | Notes |
|---------|-------------|------------|-------|
| System prompt | 5,000 | 5% | Pinned at position 0, never truncated |
| Conversation summary | 10,000 | 10% | Compressed history of older messages |
| Recent messages | 55,000 | 55% | Full messages from recent turns |
| Safety buffer (response) | 20,000 | 20% | Reserved for model output generation |
| Tool results reserve | 10,000 | 10% | Buffer for tool call results |

The system prompt is always reserved first. Before every API call, we count tokens in each segment and enforce these limits.

### Summarization Strategy

**Trigger condition:** Summarization runs when the recent messages segment exceeds 50,000 tokens (90% of its 55,000 budget). This gives a buffer so we never hit the hard limit mid-conversation.

**Summarization process:**
1. Take all messages older than the most recent 10 turns
2. Send them to the model with a summarization prompt: "Summarize this conversation history, preserving: customer identity, resolved issues, current topic, stated preferences, and any commitments made."
3. The summary is injected into the system prompt block after the base instructions
4. Original summarized messages are removed from the array

**Summary format (template):**
- Customer: [name], account [ID], [plan type]
- Resolved topics: [numbered list of issues and their resolutions]
- Current topic: [active issue with key details]
- Preferences: [communication style, stated constraints]
- Commitments: [any promises made by the agent]

**Re-summarization:** If the summary itself exceeds 8,000 tokens (80% of its budget), we re-summarize the summary combined with the next batch of old messages, compressing further. This handles very long conversations that span hours or multiple sessions.

### Conversation Reset Criteria

Start a fresh conversation when:
1. **Context exhaustion** — even after summarization, total tokens exceed 90,000 (the summary and recent messages are both at their limits). Present the user with: "This has been a long conversation. Would you like to continue or start fresh? I'll remember your key details either way."
2. **Topic shift** — if the user's new question has zero overlap with the conversation summary and recent messages (detected via a simple keyword check), offer to start a new thread.
3. **Error recovery** — if the model produces 3 consecutive low-quality or confused responses, reset with a clear notification.
4. **Explicit request** — the user says "start over" or "new conversation."
5. **Session timeout** — if more than 24 hours have passed since the last message, start fresh with a summary of the previous session injected as context.

On reset, we preserve a "persistent profile" (customer identity, past interaction summaries) that's injected into the new conversation's system prompt so the customer never has to re-identify themselves.

### Message Role Handling

**Role alternation rules:**
- Messages always follow the pattern: system, user, assistant, user, assistant...
- Tool calls use the dedicated tool_use and tool_result roles, inserted between assistant and user messages
- System context injections (e.g., "the customer's account was just flagged") use a developer/system message, never the user role
- If we need to inject a summary mid-conversation, it goes into the system prompt block, not as a standalone message

**Validation before every API call:**
- Confirm the system prompt is at position 0
- Confirm the message array ends with a user or tool_result message
- Confirm no two consecutive messages have the same role (user/user or assistant/assistant)
- Count total tokens and enforce budget limits
- If any validation fails, auto-repair the array (merge consecutive same-role messages, re-pin system prompt) before sending`,
  },
};
