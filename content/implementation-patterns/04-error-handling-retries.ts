import { Lesson } from "@/lib/types";

export const errorHandlingRetries: Lesson = {
  slug: "error-handling-retries",
  title: "Error Handling and Retries",
  description:
    "Learn how to handle API errors, implement retries with exponential backoff, and design fallback strategies for production LLM systems.",
  order: 4,
  content: {
    explanation: `LLM API calls fail. Rate limits get hit, servers go down, requests time out, and responses come back malformed. Production systems need robust error handling that recovers gracefully, retries intelligently, and falls back when necessary. This lesson covers the full error handling spectrum for LLM integrations.

**Common API Errors**

The errors you'll encounter fall into predictable categories:

- **429 Rate Limit** — you've exceeded your requests-per-minute or tokens-per-minute quota. The response usually includes a \`Retry-After\` header indicating when to try again.
- **500/503 Server Error** — the API is temporarily unavailable or overloaded. These are transient and typically resolve within seconds to minutes.
- **504 Gateway Timeout** — the request took too long. This often happens with very long prompts or when the model generates maximum-length responses. (Note: 408 Request Timeout is rare from LLM APIs — most timeouts manifest as 504 from API gateways or as client-side timeout errors.)
- **400 Bad Request** — your request is malformed (invalid JSON, messages too long, unsupported parameters). These are not retryable without fixing the request.
- **Content Filter Triggers** — the model refuses to generate a response due to safety filters. The response may have a specific finish reason or error code.

**Retry with Exponential Backoff**

For transient errors (429, 500, 503, timeouts), implement exponential backoff:

1. First retry after 1 second
2. Second retry after 2 seconds
3. Third retry after 4 seconds
4. Add random jitter (0-500ms) to each delay to prevent thundering herd

Cap the maximum number of retries (typically 3-5) and the maximum delay (30-60 seconds). Always respect the \`Retry-After\` header when present — it overrides your calculated delay.

**Circuit Breaker Pattern**

When errors persist, a circuit breaker prevents your system from hammering a failing API:

- **Closed** (normal): requests flow through normally
- **Open** (tripped): after N consecutive failures (e.g., 5), reject all requests immediately for a cooldown period (e.g., 30 seconds)
- **Half-open** (testing): after cooldown, allow one request through. If it succeeds, close the circuit. If it fails, re-open.

This protects both your system (from wasting resources on doomed requests) and the API provider (from being overwhelmed by retries).

**Fallback Strategies**

When retries are exhausted, you need fallbacks:

- **Model fallback** — try a different model (e.g., fall back from Claude Opus to Claude Sonnet for lower latency and higher availability)
- **Cached response** — return a cached response for common queries when the API is down
- **Graceful degradation** — provide a reduced-functionality experience (e.g., show pre-written FAQ answers instead of generated responses)
- **User notification** — clearly tell the user what happened and when to try again, rather than showing a generic error

**Logging and Monitoring**

Every error should be logged with: timestamp, error type, HTTP status, request ID, retry count, whether fallback was used, and latency. Set up alerts for error rate spikes (e.g., >5% of requests failing in a 5-minute window) and latency increases (e.g., P95 latency >10 seconds). Track token usage alongside errors to catch cost anomalies that might indicate infinite retry loops or runaway conversations.

**Idempotency Considerations**

Some LLM operations have side effects (tool calls, database writes). When retrying these, ensure you don't duplicate the side effects. Use idempotency keys for operations that modify state, and check whether the original operation completed before retrying.`,
    whyItMatters:
      "In production, LLM API errors are not exceptional — they're expected. Rate limits happen during traffic spikes, servers occasionally go down, and content filters trigger on edge-case inputs. Without proper error handling, these routine events become user-facing outages. Well-designed retry and fallback strategies turn potential failures into seamless experiences.",
    keyPrinciples: [
      "Classify errors as retryable (429, 500, 503, timeout) vs. non-retryable (400, 401, content filter) and handle each category differently",
      "Implement exponential backoff with jitter for retries, always respecting Retry-After headers when provided",
      "Use circuit breakers to stop hammering failing APIs after consecutive failures, protecting both your system and the provider",
      "Log every error with full context (status, request ID, retry count, latency) and alert on error rate spikes above your baseline",
    ],
  },
  example: {
    scenario:
      "An e-commerce product recommendation service uses an LLM to generate personalized suggestions. During a sale event, API errors spike due to high traffic.",
    bad: {
      userMessage: `Show me personalized product recommendations based on my browsing history.`,
      assistantResponse: `[API call to LLM]
Status: 429 Too Many Requests

[Code catches generic exception]
try {
  response = await llm.generate(prompt);
} catch (error) {
  return "Something went wrong. Please try again later.";
}

[User sees: "Something went wrong. Please try again later."]
[No retry attempted, no logging, no fallback]`,
      annotations: [
        {
          text: "Something went wrong. Please try again later.",
          note: "A generic error message tells the user nothing actionable. It doesn't distinguish between a temporary rate limit (try again in 2 seconds) and a permanent failure (your account is suspended).",
        },
        {
          text: "catches generic exception",
          note: "Catching all errors the same way means rate limits, bad requests, and server errors all get the same non-treatment. A 429 should be retried; a 400 should be debugged.",
        },
        {
          text: "No retry attempted, no logging, no fallback",
          note: "Zero resilience. The system fails on the first error with no attempt to recover. During a traffic spike, every single user gets an error page instead of a slightly delayed response.",
        },
      ],
    },
    good: {
      userMessage: `Show me personalized product recommendations based on my browsing history.`,
      assistantResponse: `[API call to LLM]
Status: 429 Too Many Requests (Retry-After: 2s)

[Error handler identifies retryable error]
→ Retry 1: wait 2s (respecting Retry-After header)
→ Status: 503 Service Unavailable
→ Retry 2: wait 4s + 230ms jitter
→ Status: 200 OK

[Response generated successfully after 2 retries]
[Logged: { status: [429, 503, 200], retries: 2, total_latency: 7230ms, request_id: "req_abc123" }]

Based on your recent browsing, here are my top picks for you:

1. **Wireless Noise-Canceling Headphones** — You've been looking at audio gear, and these are the top-rated in your price range ($149)
2. **Portable USB-C Charger** — Complements the laptop you purchased last week ($39)
3. **Ergonomic Desk Lamp** — Popular with customers who bought similar work-from-home setups ($65)

[If all retries had failed: fallback to cached popular items for user's category with note "Our recommendation engine is warming up — here are popular items in categories you like"]`,
      annotations: [
        {
          text: "Retry-After: 2s",
          note: "The system reads and respects the Retry-After header instead of guessing. This is both polite to the API provider and optimal for recovery time.",
        },
        {
          text: "wait 4s + 230ms jitter",
          note: "Exponential backoff (2s, 4s) with random jitter prevents thundering herd — thousands of clients don't all retry at the exact same time and re-trigger the rate limit.",
        },
        {
          text: "{ status: [429, 503, 200], retries: 2, total_latency: 7230ms",
          note: "Structured logging captures the full retry journey. This data powers monitoring dashboards and alerts — you'll know if error rates are climbing before users complain.",
        },
        {
          text: "fallback to cached popular items",
          note: "Even if all retries fail, the user gets a useful (if less personalized) experience. Graceful degradation means the feature is never fully broken.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write an error handling specification for a production LLM integration that powers a customer-facing chatbot.

Your specification must cover these error scenarios:
- **429 Rate Limit** — with retry strategy and user experience
- **500/503 Server Error** — with retry and circuit breaker behavior
- **Timeout (>30 seconds)** — with timeout handling and fallback
- **Invalid/malformed response** — when the model returns unparseable output
- **Content filter trigger** — when the model refuses to respond

For each scenario, define: detection method, retry behavior, fallback strategy, user-facing message, and logging requirements.`,
    starterCode: `## Error Handling Specification: Production LLM Chatbot

### 429 Rate Limit Errors
**Detection:** [how you detect this error]
**Retry:** [retry strategy]
**Fallback:** [what happens if retries fail]
**User message:** [what the user sees]
**Logging:** [what you log]

### 500/503 Server Errors
[same structure]

### Timeout Errors
[same structure]

### Invalid Response Errors
[same structure]

### Content Filter Triggers
[same structure]`,
    hints: [
      "For 429 errors, always check for a Retry-After header before calculating your own backoff delay.",
      "Consider a circuit breaker that trips after 5 consecutive 500/503 errors within a 1-minute window.",
      "Invalid responses might be partial JSON — consider whether you can salvage any useful content from the partial response.",
      "Content filter triggers are not retryable with the same input — you need to rephrase or inform the user.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your specification needs more detail — include all five error scenarios with complete handling strategies.",
      },
      {
        type: "regex",
        value: "429|[Rr]ate [Ll]imit",
        message:
          "Include handling for 429 rate limit errors with a retry strategy.",
      },
      {
        type: "regex",
        value: "500|503|[Ss]erver [Ee]rror",
        message:
          "Include handling for 500/503 server errors with circuit breaker behavior.",
      },
      {
        type: "regex",
        value: "[Tt]imeout|30 [Ss]ec|[Tt]imed? out",
        message:
          "Include handling for timeout errors with a fallback strategy.",
      },
      {
        type: "regex",
        value: "[Bb]ackoff|[Rr]etry|[Jj]itter|[Ee]xponential",
        message:
          "Describe your retry strategy — include exponential backoff, jitter, or retry limits.",
      },
      {
        type: "regex",
        value: "[Ff]allback|[Cc]ircuit [Bb]reaker|[Dd]egrad(e|ation)",
        message:
          "Include fallback strategies for when retries are exhausted (circuit breaker, graceful degradation).",
      },
    ],
    sampleSolution: `## Error Handling Specification: Production LLM Chatbot

### 429 Rate Limit Errors
**Detection:** HTTP status 429. Check for \`Retry-After\` header in the response.
**Retry:** If Retry-After header is present and <= 30 seconds, wait that duration. Otherwise, use exponential backoff: 1s, 2s, 4s with random jitter (0-500ms). Maximum 3 retries.
**Fallback:** After 3 failed retries, check the response cache for a similar query. If no cache hit, show the fallback message. If rate limits persist for >2 minutes, activate the circuit breaker.
**User message:** "I'm experiencing high demand right now. Your response is being processed and should appear in a few seconds." (Shown during retries.) If fallback activates: "Our chat service is temporarily at capacity. Please try again in a minute, or browse our FAQ at /help."
**Logging:** Log status code, Retry-After value, retry count, final outcome (success/fallback/failure), request_id, and timestamp. Alert if 429 rate exceeds 10% of requests in a 5-minute window.

### 500/503 Server Errors
**Detection:** HTTP status 500 or 503.
**Retry:** Exponential backoff: 2s, 4s, 8s with jitter. Maximum 3 retries.
**Circuit breaker:** If 5 consecutive requests return 500/503 within a 60-second window, trip the circuit breaker. In the open state, reject all requests immediately for 30 seconds. After 30 seconds, enter half-open state: allow one test request through. If it succeeds, close the circuit. If it fails, re-open for another 30 seconds.
**Fallback:** While circuit breaker is open, attempt model fallback (switch to a secondary model endpoint). If secondary also fails, serve cached responses for common queries or a static degradation message.
**User message:** During retries: show a typing indicator with no error text. If fallback activates: "I'm having a temporary issue connecting to my knowledge system. Here's a general answer based on common questions — for a more personalized response, please try again shortly."
**Logging:** Log status code, response body (truncated to 500 chars), retry count, circuit breaker state transitions, fallback model used, and request_id. Alert immediately on circuit breaker state changes.

### Timeout Errors
**Detection:** Request exceeds 30-second timeout threshold. Implement using AbortController with a 30-second signal.
**Retry:** One retry with a simplified prompt (reduce context, shorten system prompt) to decrease generation time. If the original prompt was >50k tokens, truncate to 25k before retrying. No exponential backoff — timeout retries get one immediate attempt with a reduced payload.
**Fallback:** If the retry also times out, check whether any partial response was received (some APIs support streaming partial results before timeout). If partial content is usable (>50 tokens), display it with a note. Otherwise, offer the user a simplified version of their query.
**User message:** During retry: "Taking a bit longer than expected — simplifying my response..." If fallback: "I wasn't able to generate a complete response for that question. Here's a shorter answer, or you can try rephrasing your question."
**Logging:** Log request token count, timeout duration, whether partial response was received, retry outcome, simplified prompt token count, and request_id. Alert if timeout rate exceeds 5% of requests, which may indicate prompt size issues.

### Invalid Response Errors
**Detection:** Response parsing fails — invalid JSON when structured output was expected, missing required fields, or response terminated mid-sentence (finish_reason != "stop"). Validate response structure before returning to the user.
**Retry:** Retry once with an appended instruction: "Please respond with valid [expected format]." If the response was truncated due to max_tokens, retry with a higher max_tokens value or instruct the model to be more concise. No backoff needed — these are typically not transient.
**Fallback:** If the retry also returns invalid output, attempt to extract usable content from the malformed response (e.g., parse partial JSON, use text before the truncation point). If nothing is salvageable, return a graceful degradation message.
**User message:** The user should ideally not know this happened — the retry is transparent. If fallback is needed: "I generated a response but it wasn't formatted correctly. Here's what I can share: [extracted content]. Let me know if you need more detail."
**Logging:** Log the raw response (full text), expected format, parsing error details, retry outcome, and whether partial extraction succeeded. Alert if invalid response rate exceeds 3% — this usually indicates a prompt engineering issue.

### Content Filter Triggers
**Detection:** Response has finish_reason "content_filter" or the API returns a specific content policy error code. The model either refused to respond or its response was blocked.
**Retry:** Do NOT retry with the same input — it will trigger the same filter. Instead, attempt one retry with a rephrased system prompt that adds explicit safety guardrails (e.g., "Respond only with appropriate professional content").
**Fallback:** If the rephrased attempt also triggers filters, this is likely a genuinely problematic input. Return a standard safety message and flag the conversation for human review. Do not attempt further model calls for this specific input.
**User message:** "I'm not able to help with that particular request. Could you rephrase your question? If you need assistance with [topic], I'm happy to help with a different approach."
**Logging:** Log the triggering input (redacted if it contains PII), filter type, whether rephrase retry was attempted, and final outcome. Flag for human review if the same user triggers content filters 3+ times in a session. Alert the trust & safety team on content filter spikes.`,
  },
};
