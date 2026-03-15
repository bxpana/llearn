import { Lesson } from "@/lib/types";

export const errorHandling: Lesson = {
  slug: "error-handling",
  title: "Error Handling and Recovery",
  description:
    "Design agents that gracefully handle tool failures, unexpected data, and know when to escalate to a human.",
  order: 5,
  content: {
    explanation: `In production, things break. APIs return errors, data comes back in unexpected formats, rate limits get hit, and tools time out. An agent that crashes on the first error is useless. Robust error handling is what separates a demo agent from a production-ready one.

**Types of Failures Agents Encounter**

Understanding failure categories helps you design appropriate recovery strategies:

- **Tool execution failures** — the tool call itself fails. HTTP 500 errors, network timeouts, authentication failures, service outages. These are the most common and usually transient.
- **Unexpected data** — the tool succeeds but returns data in an unexpected format, empty results, or data that contradicts the agent's assumptions. For example, a search returns zero results, or a database query returns null for a field the agent expected to exist.
- **Rate limits and throttling** — the agent is making calls too quickly and gets throttled. This requires backoff strategies, not just retries.
- **Logical failures** — the agent's plan or approach is wrong. The tool works fine, but the results don't make sense because the agent asked the wrong question or used the wrong tool.
- **Scope failures** — the task requires capabilities the agent doesn't have. No available tool can accomplish what's needed.

**Recovery Strategies (Escalation Ladder)**

Design error handling as a ladder of escalation, from least to most disruptive:

**1. Retry** — For transient failures (network errors, 500s, timeouts), retry once or twice with a brief pause. Most transient errors resolve on the next attempt. But set a retry limit — infinite retries on a persistent failure waste tokens and time.

**2. Modify and retry** — If the original request failed, try a modified version. A search with no results? Broaden the query. An API call with an invalid parameter? Try an alternative value. This is the most powerful recovery strategy because it adapts to the problem.

**3. Alternative tool** — If one tool consistently fails, try accomplishing the same goal with a different tool. Can't read a page? Search for cached versions. Database query failing? Try the API endpoint instead.

**4. Graceful degradation** — If a non-critical part of the task fails, continue without it. A research agent that can't access one source should note the gap and continue with available sources, not abort the entire task. The key word is "non-critical" — make sure the agent knows which parts are essential vs. optional.

**5. Escalate to human** — Some failures can't be recovered autonomously. The agent needs permissions it doesn't have, the task requires human judgment, or the error indicates a systemic problem. When escalating, the agent should clearly communicate: what it tried, what failed, what it needs from the human, and what it can still do in the meantime.

**Implementing Error Handling in System Prompts**

Error handling instructions should be explicit in the system prompt. Don't rely on the model to figure out error handling on its own — specify the strategies, the order of escalation, and the criteria for each level.

Key elements to include:
- **What counts as an error** — distinguish between failures that need recovery and expected empty results
- **Retry policy** — how many retries, when to retry vs. move on
- **Fallback order** — which alternative approaches to try
- **Graceful degradation rules** — what parts of the task are optional
- **Escalation criteria** — exactly when to ask the human for help
- **Error reporting** — how to communicate what went wrong and what was tried`,
    whyItMatters:
      "Production agents encounter errors on every significant task. Without explicit error handling strategies, agents either crash on the first failure (useless) or retry endlessly (expensive and slow). Well-designed error handling makes agents resilient, and clear escalation criteria ensure that humans are brought in exactly when needed — not too early (agent can't do anything alone) and not too late (agent wasted time on an unsolvable problem).",
    keyPrinciples: [
      "Design error handling as an escalation ladder: retry, modify and retry, alternative tool, graceful degradation, then escalate to human",
      "Specify error handling explicitly in the system prompt — don't rely on the model to infer recovery strategies",
      "Distinguish between transient errors (retry) and persistent failures (escalate) to avoid wasting time on unsolvable problems",
      "When escalating to a human, communicate what was tried, what failed, and what specific help is needed",
    ],
  },
  example: {
    scenario:
      "A data analysis agent is tasked with pulling sales data and generating a monthly report, but encounters multiple failures along the way.",
    bad: {
      systemPrompt: `You are a data analysis agent. You have access to:
- query_database(sql: string) — run SQL queries
- generate_chart(data: object, type: string) — create charts
- send_report(recipient: string, content: string) — email a report

Analyze data and create reports as requested.`,
      userMessage:
        "Generate the monthly sales report for March and send it to the team lead at manager@company.com.",
      assistantResponse: `I'll generate the March sales report.

[Calling query_database("SELECT * FROM sales WHERE month = 'March'")]
Error: Connection timeout

[Calling query_database("SELECT * FROM sales WHERE month = 'March'")]
Error: Connection timeout

[Calling query_database("SELECT * FROM sales WHERE month = 'March'")]
Error: Connection timeout

[Calling query_database("SELECT * FROM sales WHERE month = 'March'")]
Error: Connection timeout

[Calling query_database("SELECT * FROM sales WHERE month = 'March'")]
Error: Connection timeout

I'm sorry, I'm unable to generate the report because the database is not responding. Please try again later.`,
      annotations: [
        {
          text: "Analyze data and create reports as requested",
          note: "No error handling instructions at all. The agent has no guidance on what to do when tools fail, how many times to retry, or when to try alternatives.",
        },
        {
          text: "Error: Connection timeout",
          note: "Five identical retries of the exact same failing query. No backoff, no modification, no alternative approach. Each retry wastes tokens and time on the same transient error.",
        },
        {
          text: "I'm sorry, I'm unable to generate the report",
          note: "After failing, the agent gives up entirely with no useful information. It doesn't say what it tried, suggest alternatives, or offer to do any partial work.",
        },
      ],
    },
    good: {
      systemPrompt: `You are a data analysis agent. You have access to:
- query_database(sql: string) — run SQL queries against the sales database
- query_cache(report_name: string) — retrieve cached results from previous report runs
- generate_chart(data: object, type: string) — create charts from data
- send_report(recipient: string, content: string) — email a report

## Error Handling Protocol

When a tool call fails, follow this escalation ladder:

1. **Retry once** — If a tool fails with a transient error (timeout, 500), retry once after rephrasing or simplifying the query. Do NOT retry more than once with the same parameters.

2. **Try alternatives** — If retry fails, try an alternative approach:
   - Database timeout → try query_cache for recent data
   - Chart generation fails → include data as a formatted table instead
   - Email fails → present the report content directly to the user

3. **Degrade gracefully** — If some data is unavailable, generate a partial report with what you have. Clearly mark which sections are missing and why.

4. **Escalate** — If you cannot produce any meaningful output, tell the user:
   - What you tried (tools and approaches)
   - What specifically failed
   - What they can do (e.g., "check database connectivity" or "try again in 30 minutes")

Never retry the same failing call more than twice total. Never silently skip data — always note what's missing.`,
      userMessage:
        "Generate the monthly sales report for March and send it to the team lead at manager@company.com.",
      assistantResponse: `I'll generate the March sales report. Let me start by pulling the sales data.

[Calling query_database("SELECT region, product_category, SUM(revenue) as total_revenue, COUNT(*) as num_orders FROM sales WHERE sale_date BETWEEN '2024-03-01' AND '2024-03-31' GROUP BY region, product_category")]
Error: Connection timeout

The database timed out. Let me retry with a simpler query.

[Calling query_database("SELECT region, SUM(revenue) as total_revenue FROM sales WHERE sale_date BETWEEN '2024-03-01' AND '2024-03-31' GROUP BY region")]
Error: Connection timeout

Database is still unavailable. Switching to cached data as fallback.

[Calling query_cache("monthly_sales_march_2024")]
Result: { generated: "2024-03-29", data: { total_revenue: 1240000, by_region: { north: 420000, south: 310000, east: 280000, west: 230000 }, by_category: { electronics: 520000, clothing: 380000, home: 340000 }, top_product: "Wireless Earbuds Pro", num_orders: 8450 }}

Got cached data from March 29. This is 2 days old but usable. Let me generate the chart.

[Calling generate_chart({ labels: ["North", "South", "East", "West"], values: [420000, 310000, 280000, 230000] }, "bar")]
Result: { chart_url: "https://charts.internal/abc123" }

Now let me compile and send the report.

[Calling send_report("manager@company.com", "## March 2024 Sales Report\\n\\n**Note: This report uses cached data from March 29 (live database temporarily unavailable). Final numbers for March 30-31 are not included.**\\n\\n### Summary\\n- Total Revenue: $1,240,000\\n- Total Orders: 8,450\\n- Top Product: Wireless Earbuds Pro\\n\\n### Revenue by Region\\n- North: $420,000 (34%)\\n- South: $310,000 (25%)\\n- East: $280,000 (23%)\\n- West: $230,000 (19%)\\n\\n### Revenue by Category\\n- Electronics: $520,000\\n- Clothing: $380,000\\n- Home: $340,000\\n\\n[Regional Breakdown Chart: charts.internal/abc123]\\n\\n---\\n*Data source: Cached report from 2024-03-29. For complete March data, regenerate this report once the database connection is restored.*")]
Result: { sent: true, message_id: "msg_4412" }

**Report sent successfully to manager@company.com.**

Important notes:
- The live database was unavailable (connection timeout), so I used cached data from March 29
- The report is missing data from March 30-31 — final numbers may differ slightly
- Once the database is back online, you can request a regenerated report with complete data`,
      annotations: [
        {
          text: "Let me retry with a simpler query",
          note: "First retry modifies the query (simpler) rather than repeating the exact same call. This is 'modify and retry' — more likely to succeed and shows intelligent adaptation.",
        },
        {
          text: "Switching to cached data as fallback",
          note: "After two database failures, the agent escalates to the next strategy: alternative tool (query_cache). It doesn't retry the database a third time.",
        },
        {
          text: "This report uses cached data from March 29",
          note: "Graceful degradation with transparency. The report clearly notes the limitation so the recipient knows the data is 2 days old. The agent didn't silently skip or give up.",
        },
        {
          text: "Once the database is back online, you can request a regenerated report",
          note: "The escalation message is actionable: it tells the user what happened, what's missing, and what to do about it. This is far more useful than 'try again later.'",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write error handling instructions for an agent system prompt. The agent is a customer support assistant with these tools:

- \`lookup_account(customer_id: string)\` — retrieves customer account details
- \`search_knowledge_base(query: string)\` — searches help articles
- \`create_ticket(subject: string, body: string, priority: string)\` — creates a support ticket
- \`apply_resolution(account_id: string, action: string, params: object)\` — applies a fix (refund, credit, plan change, etc.)

Write error handling instructions covering:
1. **Tool failure recovery** — what to do when each tool fails (retry policy, alternatives)
2. **Ambiguous results** — what to do when search results are unclear or account data is unexpected
3. **Rate limits** — how to handle throttling
4. **Scope limits** — what to do when the agent can't resolve the customer's issue
5. **Error communication** — how to report errors to the customer professionally`,
    starterCode: `## Error Handling Instructions

### Tool Failure Recovery
[retry policy and alternatives for each tool]

### Handling Ambiguous Results
[what to do when results are unclear]

### Rate Limit Handling
[how to handle throttling]

### Scope Limits
[when to escalate to a human agent]

### Communicating Errors to Customers
[how to keep the customer informed professionally]`,
    hints: [
      "Different tools need different retry strategies — a database lookup might be retried, but applying a refund should NOT be retried blindly.",
      "For ambiguous results, the agent should ask the customer for clarification rather than guessing.",
      "Rate limits require backing off, not just retrying — distinguish between 'try again soon' and 'you've been blocked.'",
      "Define specific scenarios that require human escalation: billing disputes over a threshold, legal requests, technical issues requiring backend access.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your error handling instructions need more detail — cover all 5 areas with specific strategies.",
      },
      {
        type: "regex",
        value: "[Rr]etry|[Rr]eattempt|[Tt]ry again",
        message:
          "Include retry policies — specify when and how many times to retry failed tool calls.",
      },
      {
        type: "regex",
        value: "[Aa]mbiguous|[Uu]nclear|[Uu]nexpected|[Cc]larif|[Cc]onfirm with",
        message:
          "Address ambiguous results — what should the agent do when data is unclear or unexpected?",
      },
      {
        type: "regex",
        value: "[Rr]ate [Ll]imit|[Tt]hrottl|[Bb]ack.?off|429|[Ss]low down",
        message:
          "Include rate limit handling — how should the agent respond to throttling?",
      },
      {
        type: "regex",
        value: "[Ee]scalat|[Hh]uman|[Tt]ransfer|[Ss]upervisor|[Ss]upport [Tt]eam",
        message:
          "Define when to escalate to a human — which issues can't be resolved autonomously?",
      },
      {
        type: "regex",
        value: "[Cc]ustomer|[Uu]ser|[Aa]pologi|[Tt]ranspar|[Ii]nform|[Cc]ommunicat",
        message:
          "Include instructions for communicating errors to the customer professionally.",
      },
    ],
    sampleSolution: `## Error Handling Instructions

### Tool Failure Recovery

Follow this escalation ladder for each tool. Never retry the same failing call more than twice total.

**lookup_account failures:**
- Timeout or 500 error: Retry once. If it fails again, tell the customer you're experiencing a temporary issue accessing their account and ask them to confirm their account details verbally while you create a ticket.
- "Account not found": Do NOT retry. Ask the customer to confirm their customer ID or email. They may have a different ID than expected. Try once with the corrected identifier.
- Authentication error: Do not retry. This is a system configuration issue. Escalate to the support team immediately and inform the customer.

**search_knowledge_base failures:**
- Timeout: Retry once with a simpler, shorter query. If it fails again, attempt to answer from your training knowledge but clearly state: "I'm providing general guidance while our help system is temporarily unavailable. Let me create a ticket for you to get a verified answer."
- Zero results: Do NOT treat this as an error. Rephrase the query with different keywords (up to 2 rephrases). If still no results, acknowledge the gap honestly and create a ticket for the team to follow up.

**create_ticket failures:**
- Retry once on any error. If it fails again, inform the customer that you'll make sure their issue is logged and provide them a reference summary of the conversation they can share if they need to follow up.
- Never silently fail on ticket creation — the customer must know their issue was or was not logged.

**apply_resolution failures:**
- CRITICAL: Do NOT blindly retry apply_resolution. This tool has side effects (refunds, credits, plan changes). A timeout does NOT mean the action didn't happen.
- On timeout or unclear response: First check the account state using lookup_account to see if the resolution was already applied. Only retry if you can confirm the action did not take effect.
- On explicit error (e.g., "insufficient balance", "invalid action"): Do not retry. Report the specific error to the customer and escalate if needed.
- On permission denied: Escalate to a supervisor. Inform the customer that their resolution requires additional approval and provide a timeline.

### Handling Ambiguous Results

When results are unclear or unexpected, do NOT guess. Instead:

- **Multiple matching accounts:** Ask the customer to confirm their identity with additional details (email, last 4 digits of payment method, account creation date). Never pick one at random.
- **Ambiguous knowledge base results:** Present the top 2-3 relevant articles to the customer and ask which one matches their situation, rather than assuming.
- **Unexpected account state** (e.g., account shows "cancelled" but customer says they're active): Acknowledge the discrepancy. Say "I'm seeing something unexpected on your account. Let me create a priority ticket to investigate this properly." Do NOT attempt to apply resolutions to accounts in an unexpected state.
- **Contradictory information:** If the customer's description contradicts what you see in their account, ask clarifying questions before proceeding. Never assume the data is correct and the customer is wrong.

### Rate Limit Handling

If you receive a rate limit response (HTTP 429 or throttling message):

1. Do NOT immediately retry. Inform the customer: "I need a brief moment to process your request."
2. On your next action, try a different tool or a different approach that doesn't hit the same endpoint.
3. If the rate limit affects a critical tool (lookup_account or apply_resolution), slow down your workflow: handle one step at a time and avoid parallel operations.
4. If rate limiting persists across multiple tools, this may indicate a system-wide issue. Escalate to the support team and offer the customer the option to call back or receive a follow-up.

Never retry a rate-limited call more than once. Back off and try alternative approaches first.

### Scope Limits

Escalate to a human agent when ANY of these conditions apply:

- **Billing disputes over $500** — you can apply credits up to $500 autonomously, but larger amounts require supervisor approval.
- **Legal or regulatory requests** — GDPR data deletion requests, legal holds, subpoena-related inquiries. Do not attempt to handle these. Transfer immediately.
- **Technical issues requiring backend access** — if the customer's problem requires database changes, server restarts, or infrastructure investigation beyond your tools.
- **Repeated failed resolutions** — if you've attempted 2 different resolutions and neither worked, escalate rather than continuing to troubleshoot.
- **Customer requests a human** — immediately and politely transfer. Never argue with a customer who wants to speak to a person.
- **Safety concerns** — threats of self-harm, threats against others, or any situation requiring immediate human judgment.

When escalating, always provide the human agent with: (1) a summary of the customer's issue, (2) what you already tried, (3) what failed and why, and (4) any relevant account details you've gathered.

### Communicating Errors to Customers

- **Be transparent, not technical.** Say "I'm having trouble accessing your account details right now" not "The lookup_account API returned a 503 Service Unavailable error."
- **Apologize briefly and focus on the solution.** "I apologize for the delay. While I work on resolving this, let me..." Not lengthy apologies that waste the customer's time.
- **Always offer a next step.** Never leave the customer in a dead end. If you can't resolve the issue right now, offer: creating a ticket, scheduling a callback, transferring to a specialist, or providing a reference number.
- **Set expectations on timing.** If creating a ticket, tell the customer when to expect a follow-up: "You'll hear back within 24 hours" is better than "someone will get back to you."
- **Summarize at the end.** Before closing any conversation where errors occurred, recap: what was resolved, what's still pending, and what the customer should expect next.`,
  },
};
