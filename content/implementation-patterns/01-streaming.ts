import { Lesson } from "@/lib/types";

export const streaming: Lesson = {
  slug: "streaming",
  title: "Streaming Responses",
  description:
    "Understand why streaming matters for UX and learn implementation patterns for real-time LLM output.",
  order: 1,
  content: {
    explanation: `Streaming is the practice of sending LLM output to the client incrementally as tokens are generated, rather than waiting for the full response to complete. This is one of the most impactful UX improvements you can make in any LLM-powered application.

**Why Streaming Matters: Time-to-First-Token**

Without streaming, users stare at a blank screen for the entire generation time — often 3-15 seconds for longer responses. With streaming, the first tokens appear in 100-300ms, giving users immediate feedback that their request is being processed. This dramatically reduces perceived latency even though total generation time is identical.

**Server-Sent Events (SSE)**

The standard protocol for streaming LLM responses is Server-Sent Events. SSE uses a persistent HTTP connection where the server pushes events to the client. Each event contains a chunk of the response — typically one or a few tokens. The client accumulates these chunks and renders them progressively. Most LLM APIs (OpenAI, Anthropic, etc.) return SSE streams with a consistent format: each event includes the delta text and metadata like finish reason.

**Handling Partial JSON and Structured Output**

Streaming gets tricky when your application expects structured output (JSON, XML, etc.). A partial JSON string is invalid JSON, so you can't parse it mid-stream. Common strategies include:

- **Stream the text, parse at the end** — show raw text during generation, then switch to structured rendering once complete
- **Streaming JSON parsers** — libraries that can extract complete key-value pairs as they appear in the stream
- **Dual-channel responses** — ask the model to produce a human-readable summary first, then structured data, so users see useful text while the structured portion generates

**When to Stream vs. Wait**

Not every LLM call should be streamed. Stream when the output is displayed directly to a user (chat, writing, explanations). Wait for the full response when:

- You need to validate or transform the response before showing it
- The response feeds into another system call (tool use, database writes)
- The output is short enough that streaming adds no perceptible benefit (< 1 second generation)

**Client-Side Rendering Patterns**

On the frontend, rendering streamed text requires care. Naive approaches that re-render the entire response on every token cause layout thrashing and poor performance. Best practices include: appending only new tokens to the DOM, using CSS for the typing cursor effect, throttling React state updates to every 50-100ms rather than every token, and handling markdown rendering incrementally rather than re-parsing the full text on each update.

**Backpressure and Connection Management**

In production, you also need to handle disconnections gracefully. If a user navigates away mid-stream, abort the underlying API call to save tokens and cost. Implement heartbeat mechanisms to detect stale connections, and consider buffering a few tokens server-side to smooth out network jitter.`,
    whyItMatters:
      "Streaming transforms the user experience from frustrating waits to engaging, real-time interaction. Users perceive streamed responses as significantly faster even when total generation time is the same. For any customer-facing LLM application, implementing streaming is often the single biggest UX win available with relatively low engineering effort.",
    keyPrinciples: [
      "Stream responses for user-facing text to reduce perceived latency from seconds to milliseconds",
      "Use Server-Sent Events as the transport protocol and handle partial chunks with incremental rendering",
      "Buffer or wait for complete responses when you need structured output validation or downstream processing",
      "Always abort upstream API calls when the client disconnects to avoid wasting tokens and money",
    ],
  },
  example: {
    scenario:
      "A team is building a chatbot that answers customer questions. Responses average 300 tokens and take 4-8 seconds to generate fully.",
    bad: {
      userMessage: `How do I reset my account password?`,
      assistantResponse: `[8 seconds of blank screen with a loading spinner]

To reset your account password, follow these steps:

1. Go to the login page at app.example.com/login
2. Click "Forgot Password" below the sign-in form
3. Enter the email address associated with your account
4. Check your inbox for a reset link (arrives within 2 minutes)
5. Click the link and enter your new password
6. Your new password must be at least 12 characters with one uppercase letter and one number

If you don't receive the email, check your spam folder or contact support@example.com.`,
      annotations: [
        {
          text: "8 seconds of blank screen with a loading spinner",
          note: "Users experience the full generation latency with zero feedback. Many will assume the app is broken and refresh or leave.",
        },
        {
          text: "To reset your account password",
          note: "The useful answer exists but arrives all at once after a painful wait. The user gets no progressive value during generation.",
        },
        {
          text: "If you don't receive the email",
          note: "The entire response — including this edge case at the end — is delivered in one block. Front-loading the most important info doesn't help because nothing appears until everything is ready.",
        },
      ],
    },
    good: {
      userMessage: `How do I reset my account password?`,
      assistantResponse: `[First tokens appear in ~200ms, streaming visibly]

To reset your password: ← appears first, giving immediate value

1. Go to app.example.com/login ← streams within 500ms
2. Click "Forgot Password"
3. Enter your email address
4. Check your inbox for the reset link ← user already has what they need
5. Click the link and set a new password (12+ chars, one uppercase, one number)

Didn't get the email? Check spam or contact support@example.com. ← arrives last, ~3 seconds total`,
      annotations: [
        {
          text: "First tokens appear in ~200ms",
          note: "Time-to-first-token is under 300ms. The user sees immediate proof that their request is being handled, dramatically reducing perceived latency.",
        },
        {
          text: "To reset your password:",
          note: "The response is structured to front-load actionable information. Even if the user stops reading partway through, they have the core answer.",
        },
        {
          text: "streams within 500ms",
          note: "By 500ms the user already has the first concrete step. Compare this to 8 seconds of nothing in the non-streaming version.",
        },
        {
          text: "arrives last, ~3 seconds total",
          note: "Total generation time is similar, but the experience is fundamentally different. The user was engaged throughout rather than waiting in uncertainty.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design a streaming implementation plan for an AI chatbot that helps users write and edit documents.

Your plan must cover:
- **When to stream vs. buffer**: Identify which types of responses should be streamed to the user in real-time and which should be fully generated before display
- **Structured output handling**: How to handle cases where the chatbot returns structured data (e.g., JSON with suggested edits) mid-stream
- **Progress indicators for tool calls**: When the chatbot uses tools (search, spell-check, etc.), how to show progress while the tool executes
- **Error and disconnection handling**: What happens if the stream breaks or the user navigates away

Write your plan as a structured technical document with clear sections and specific implementation details.`,
    starterCode: `## Streaming Implementation Plan: Document Assistant Chatbot

### When to Stream vs. Buffer
[Describe which response types get streamed and which wait for completion]

### Structured Output Handling
[How to handle JSON/structured data in streamed responses]

### Tool Call Progress Indicators
[How to show progress when the chatbot invokes tools]

### Error and Disconnection Handling
[What happens when things go wrong mid-stream]`,
    hints: [
      "Think about the different types of responses: freeform text, suggested edits (JSON), search results, error messages.",
      "For structured output, consider a two-phase approach: stream a human-readable summary, then deliver structured data at the end.",
      "Tool calls can take variable time — consider intermediate status messages like 'Searching documents...' while tools execute.",
      "Don't forget to cancel the upstream API call if the user disconnects to save costs.",
    ],
    validation: [
      {
        type: "min-length",
        value: 400,
        message:
          "Your plan needs more detail — include specific implementation details for each section.",
      },
      {
        type: "regex",
        value: "[Ss]tream|[Bb]uffer|[Ww]ait",
        message:
          "Describe when to stream responses vs. buffer them for complete delivery.",
      },
      {
        type: "regex",
        value: "[Ss]tructured|JSON|[Pp]ars(e|ing)",
        message:
          "Address how to handle structured output (like JSON) during streaming.",
      },
      {
        type: "regex",
        value: "[Tt]ool|[Pp]rogress|[Ss]tatus|[Ii]ndicator",
        message:
          "Include a strategy for showing progress during tool calls.",
      },
      {
        type: "regex",
        value: "[Dd]isconnect|[Aa]bort|[Cc]ancel|[Ee]rror|[Ff]ail",
        message:
          "Address error handling and what happens when the connection drops.",
      },
      {
        type: "regex",
        value: "SSE|[Ee]vent|[Cc]hunk|[Tt]oken",
        message:
          "Reference the streaming protocol or mechanism (SSE, chunks, tokens).",
      },
    ],
    sampleSolution: `## Streaming Implementation Plan: Document Assistant Chatbot

### When to Stream vs. Buffer

**Stream in real-time:**
- Freeform text responses (explanations, summaries, chat replies) — these benefit most from streaming because the user can start reading immediately. Each token is appended to the display as it arrives via SSE chunks.
- Long-form document drafts — when the user asks "write me an introduction," stream the text so they see progress and can mentally edit as it generates.

**Buffer for complete delivery:**
- Suggested edits in structured JSON format — wait for the full response, validate the JSON, then render as a diff view. Partial JSON cannot be applied to the document.
- Search results — the tool call must complete before we have results to display. Buffer these and show a progress indicator instead.
- Short confirmations (e.g., "Document saved") — generation is under 500ms, streaming adds no perceived benefit.

### Structured Output Handling

For responses that mix freeform text with structured data, use a two-phase approach:

1. **Phase 1 (streamed):** The model generates a human-readable summary first (e.g., "I found 3 issues in your document: a grammar error in paragraph 2, a tone inconsistency in paragraph 5, and a missing citation in paragraph 8.")
2. **Phase 2 (buffered):** After the summary, the model produces a JSON block with precise edit locations and replacements. We detect the JSON boundary using a delimiter token, stop rendering to the chat, and parse the complete JSON once the stream finishes.

For pure structured output (no summary needed), we show a typing indicator with the message "Analyzing your document..." while the full response generates, then render the structured result.

### Tool Call Progress Indicators

When the chatbot invokes tools during a response, we implement progressive status updates:

1. **Tool invocation detected:** Display a status chip (e.g., "Searching your documents..." or "Running spell check...") with an animated indicator.
2. **Tool execution:** The server proxies the tool call and monitors progress. For long-running tools (>2 seconds), emit periodic SSE heartbeat events so the client knows the connection is alive.
3. **Tool result received:** Replace the status chip with a brief summary ("Found 12 results") and continue streaming the model's response that incorporates the tool results.
4. **Parallel tool calls:** If multiple tools run simultaneously, show multiple status chips and resolve them independently as each completes.

### Error and Disconnection Handling

**Stream interruption (network error):**
- Client detects the SSE connection drop and shows "Connection lost. Reconnecting..." with a retry button.
- The server caches the last 30 seconds of streamed tokens per session. On reconnect, the client sends its last received event ID and the server replays missed chunks.
- After 3 failed reconnection attempts, show the partial response with a "Generation interrupted" notice and offer to retry the full request.

**User navigates away or cancels:**
- The client sends an abort signal (AbortController) which propagates to the server.
- The server immediately cancels the upstream API call to stop token generation and save cost.
- Partial responses are discarded unless the user explicitly chose "Stop generating," in which case the partial response is preserved in the chat history.

**API errors mid-stream:**
- If the LLM API returns an error after partial generation, append an error notice to the partial response: "Response incomplete due to a service error. Click to retry."
- Log the error with the partial response for debugging and monitoring.
- For rate limit errors (429), queue the request with exponential backoff and show "High demand — your response will continue shortly."`,
  },
};
