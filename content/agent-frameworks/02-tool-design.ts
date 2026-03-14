import { Lesson } from "@/lib/types";

export const toolDesign: Lesson = {
  slug: "tool-design",
  title: "Tool Design for Agents",
  description:
    "Design clear tool names, descriptions, and parameter schemas that LLMs can use effectively.",
  order: 2,
  content: {
    explanation: `Tools are how agents interact with the world — APIs, databases, file systems, and external services. But an agent is only as good as the tools it can use, and tool design is where most agent implementations go wrong. An LLM decides which tool to call based entirely on the tool's name, description, and parameter schema. If these are unclear, the agent will make wrong tool choices, pass bad parameters, or fail to use tools at all.

**Clear, Descriptive Names** — Tool names should be verb-noun pairs that describe exactly what the tool does: \`search_products\`, \`get_order_status\`, \`send_email\`. Avoid generic names like \`process\`, \`handle\`, or \`do_action\`. The name alone should tell the agent when to use the tool.

**Detailed Descriptions** — The tool description is the most important field for agent decision-making. It should explain: what the tool does, when to use it (and when NOT to use it), what it returns, and any side effects. Think of the description as instructions to a new team member who needs to decide whether to use this tool.

**Typed Parameters with Constraints** — Every parameter needs a type, a description, and where applicable, constraints (enum values, min/max, required vs. optional). Vague parameters like \`data: object\` force the agent to guess the structure. Explicit schemas like \`customer_id: string (required) — the unique customer identifier, e.g., "cust_abc123"\` eliminate ambiguity.

**Principle of Least Privilege** — Each tool should have the minimum permissions needed to do its job. A tool that reads customer data should not also be able to modify it. Separating read and write operations into distinct tools gives the agent (and you) finer-grained control and makes mistakes less costly.

**Atomic and Composable** — Design tools that do one thing well. A tool that searches for products, adds them to a cart, AND processes payment is impossible for the agent to use partially. Three separate tools (\`search_products\`, \`add_to_cart\`, \`process_payment\`) let the agent compose them as needed and handle errors at each step.

**Return Structured Data** — Tools should return structured, predictable responses. Include a consistent format with a status indicator, the primary data, and any metadata the agent needs for its next decision. Avoid returning raw HTML, unstructured text blobs, or error codes without explanations.

**Error Messages That Help** — When a tool fails, the error message should tell the agent what went wrong and suggest what to do next. Instead of \`Error: 404\`, return \`Customer not found. Verify the customer_id format (expected: "cust_" prefix followed by alphanumeric characters) or try searching by email with search_customers.\``,
    whyItMatters:
      "Tool design is the bottleneck of agent performance. You can have the best planning prompt in the world, but if the tools are poorly designed, the agent will make wrong choices, pass invalid parameters, and produce unreliable results. Well-designed tools make agents dramatically more reliable because the LLM can reason clearly about what each tool does and when to use it.",
    keyPrinciples: [
      "Tool names should be verb-noun pairs that unambiguously describe the action — search_products, not process_data",
      "Write tool descriptions as if explaining to a new team member: what it does, when to use it, when not to, and what it returns",
      "Design atomic tools that do one thing well — the agent should compose them, not rely on one mega-tool",
      "Return structured, consistent responses with clear error messages that suggest next steps for the agent",
    ],
  },
  example: {
    scenario:
      "A team is designing tools for a customer service agent that handles order inquiries, returns, and account updates.",
    bad: {
      systemPrompt: `You have access to this tool:

customer_action(params: object) — Does customer stuff. Pass in whatever parameters are needed.`,
      userMessage: `A customer asks: "Where is my order #ORD-7829? I ordered it a week ago and haven't received any tracking information."

Use your tools to help this customer.`,
      assistantResponse: `Let me help with that.

[Calling customer_action({action: "lookup", order: "ORD-7829"})]
Result: {status: "shipped", tracking: "1Z999AA10123456784"}

[Calling customer_action({action: "send_tracking", customer: "???", tracking: "1Z999AA10123456784"})]
Error: Missing required field "customer_email"

[Calling customer_action({action: "send_tracking", customer_email: "unknown", tracking: "1Z999AA10123456784"})]
Error: Invalid email format

I found your order was shipped with tracking number 1Z999AA10123456784, but I wasn't able to send you the tracking details directly. You can track your package using that number.`,
      annotations: [
        {
          text: "customer_action(params: object) — Does customer stuff",
          note: "Vague name, untyped parameters, and useless description. The agent has to guess the parameter structure, leading to trial-and-error calls that waste tokens and time.",
        },
        {
          text: "action: \"lookup\", order: \"ORD-7829\"",
          note: "The agent is guessing parameter names. Without a schema, it invented 'action' and 'order' — and happened to get lucky on the first call.",
        },
        {
          text: "customer: \"???\"",
          note: "The agent doesn't know what parameters the tool needs for sending tracking info. It guessed 'customer', then 'customer_email', each time failing.",
        },
      ],
    },
    good: {
      systemPrompt: `You have access to these tools:

1. get_order_status(order_id: string)
   Description: Retrieves the current status of a customer order. Returns shipping status, tracking number (if shipped), estimated delivery date, and item details. Use this when a customer asks about their order. The order_id format is "ORD-" followed by digits (e.g., "ORD-7829").
   Returns: { status: "processing" | "shipped" | "delivered" | "cancelled", tracking_number?: string, estimated_delivery?: string, items: string[] }

2. get_customer_profile(customer_id: string)
   Description: Retrieves a customer's profile information including name, email, and contact preferences. Use this to look up contact details before sending notifications. Do NOT use this to verify identity — that requires verify_customer.
   Returns: { name: string, email: string, phone?: string, contact_preference: "email" | "sms" }

3. send_notification(customer_id: string, channel: "email" | "sms", template: "tracking_update" | "return_status" | "general", data: { subject: string, body: string })
   Description: Sends a notification to the customer via their preferred channel. Always call get_customer_profile first to determine the right channel. Requires customer_id, not email directly.
   Returns: { sent: boolean, message_id: string }

4. initiate_return(order_id: string, reason: string, items: string[])
   Description: Starts a return process for specific items in an order. Only works for orders with status "delivered". For orders still in transit, use cancel_order instead. The customer will receive return instructions automatically.
   Returns: { return_id: string, return_label_url: string, deadline: string }`,
      userMessage: `A customer (ID: cust_4421) asks: "Where is my order #ORD-7829? I ordered it a week ago and haven't received any tracking information."

Use your tools to help this customer.`,
      assistantResponse: `I'll look up the order status and get the customer's contact details so I can send them tracking information.

[Calling get_order_status("ORD-7829")]
Result: { status: "shipped", tracking_number: "1Z999AA10123456784", estimated_delivery: "2024-03-18", items: ["Wireless Headphones"] }

[Calling get_customer_profile("cust_4421")]
Result: { name: "Sarah Chen", email: "sarah@example.com", contact_preference: "email" }

The order has shipped. Let me send Sarah the tracking details via her preferred channel (email).

[Calling send_notification("cust_4421", "email", "tracking_update", { subject: "Tracking info for order #ORD-7829", body: "Your Wireless Headphones have shipped! Tracking: 1Z999AA10123456784. Estimated delivery: March 18." })]
Result: { sent: true, message_id: "msg_8891" }

Your order #ORD-7829 (Wireless Headphones) has been shipped! Your tracking number is 1Z999AA10123456784, and the estimated delivery date is March 18. I've also sent these details to your email at sarah@example.com.`,
      annotations: [
        {
          text: "get_order_status(order_id: string)",
          note: "Clear verb-noun name, typed parameter, specific description of what it returns and when to use it. The agent knows exactly how to call this tool.",
        },
        {
          text: "Do NOT use this to verify identity",
          note: "Telling the agent when NOT to use a tool is just as important as telling it when to use it. This prevents misuse.",
        },
        {
          text: "Always call get_customer_profile first",
          note: "The description explains tool dependencies — the agent knows it needs the profile before sending a notification. This ordering guidance prevents errors.",
        },
        {
          text: "Only works for orders with status \"delivered\"",
          note: "Preconditions in tool descriptions help the agent avoid invalid calls. It knows to check status before attempting a return.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design tool interfaces for 3 tools that a customer service agent would use.

For each tool, define:
- **Name** — a clear verb-noun name
- **Description** — what it does, when to use it, when NOT to use it, any preconditions
- **Parameters** — name, type, required/optional, description with examples
- **Return type** — structured response format

Design tools for these capabilities:
1. Looking up a customer's subscription details
2. Applying a discount or credit to a customer's account
3. Searching the knowledge base for help articles

Make the tools atomic, clearly described, and easy for an LLM to use correctly.`,
    starterCode: `## Customer Service Agent — Tool Definitions

### Tool 1: [name]
**Description:** [what it does, when to use it, when not to]

**Parameters:**
- \`param_name\` (type, required/optional): [description]

**Returns:**
\`\`\`
{ [structured response format] }
\`\`\`

### Tool 2: [name]
**Description:** [what it does, when to use it, when not to]

**Parameters:**
- \`param_name\` (type, required/optional): [description]

**Returns:**
\`\`\`
{ [structured response format] }
\`\`\`

### Tool 3: [name]
**Description:** [what it does, when to use it, when not to]

**Parameters:**
- \`param_name\` (type, required/optional): [description]

**Returns:**
\`\`\`
{ [structured response format] }
\`\`\``,
    hints: [
      "Use verb-noun naming: get_subscription, apply_credit, search_articles — not 'handle_subscription' or 'process.'",
      "Include when NOT to use each tool — e.g., 'Do not use apply_credit for refunds — use initiate_refund instead.'",
      "Add parameter examples: 'customer_id (string, required) — e.g., \"cust_abc123\"' removes ambiguity.",
      "Think about what the agent needs in the return value to decide its next step — include status fields and actionable data.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your tool definitions need more detail — include descriptions, typed parameters, and return formats for all 3 tools.",
      },
      {
        type: "regex",
        value: "[Dd]escription",
        message:
          "Each tool needs a description explaining what it does and when to use it.",
      },
      {
        type: "regex",
        value: "[Pp]arameter|[Pp]aram|\\(string|\\(number|\\(boolean|type:",
        message:
          "Define typed parameters for each tool — include name, type, and whether they're required or optional.",
      },
      {
        type: "regex",
        value: "[Rr]eturn|[Rr]esponse|[Oo]utput",
        message:
          "Specify the return type for each tool so the agent knows what data it will receive.",
      },
      {
        type: "regex",
        value: "[Dd]o [Nn]ot|[Nn]ot use|[Aa]void|[Ii]nstead|[Ww]hen not|[Dd]on't",
        message:
          "Include guidance on when NOT to use each tool — this prevents agent misuse.",
      },
      {
        type: "regex",
        value: "[Rr]equired|[Oo]ptional",
        message:
          "Mark each parameter as required or optional so the agent knows which fields it must provide.",
      },
    ],
    sampleSolution: `## Customer Service Agent — Tool Definitions

### Tool 1: get_subscription
**Description:** Retrieves a customer's current subscription details including plan type, billing cycle, renewal date, and payment method. Use this when a customer asks about their subscription, wants to know their plan details, or when you need subscription info before making changes. Do not use this to modify the subscription — use update_subscription for changes. Do not use this to look up billing history — use get_billing_history instead.

**Parameters:**
- \`customer_id\` (string, required): The unique customer identifier, e.g., "cust_abc123". This is the primary lookup key.
- \`include_usage\` (boolean, optional): If true, includes current period usage stats (API calls, storage, etc.). Defaults to false. Set to true when the customer is asking about usage limits or overages.

**Returns:**
\`\`\`
{
  status: "active" | "paused" | "cancelled" | "past_due",
  plan: { name: string, tier: "free" | "pro" | "enterprise", monthly_price: number },
  billing_cycle: "monthly" | "annual",
  next_renewal: string (ISO date),
  payment_method: { type: "card" | "invoice", last_four?: string },
  usage?: { api_calls: { used: number, limit: number }, storage_gb: { used: number, limit: number } }
}
\`\`\`

### Tool 2: apply_account_credit
**Description:** Applies a credit or discount to a customer's account. The credit will be applied to the next billing cycle. Use this when offering a goodwill credit for service issues, applying a promotional discount, or honoring a price match. Do not use this for refunds of past charges — use initiate_refund for that. Do not apply credits exceeding $100 without supervisor approval (the tool will reject amounts over $100 and return an error with escalation instructions).

**Parameters:**
- \`customer_id\` (string, required): The customer to credit, e.g., "cust_abc123".
- \`amount\` (number, required): Credit amount in dollars, e.g., 25.00. Must be positive and no greater than 100.00 without supervisor approval.
- \`reason\` (string, required): Why the credit is being applied. This is logged for audit purposes. Be specific, e.g., "Service outage on 2024-03-10 affecting API availability for 4 hours."
- \`type\` (string, required): One of "goodwill", "promotional", "price_match", or "service_recovery". Determines which budget the credit is charged against.
- \`expires_at\` (string, optional): ISO date when the credit expires. If not provided, credit does not expire. Use for promotional credits that should be time-limited.

**Returns:**
\`\`\`
{
  success: boolean,
  credit_id: string,
  applied_amount: number,
  new_account_balance: number,
  message: string (confirmation or error description with next steps)
}
\`\`\`

### Tool 3: search_knowledge_base
**Description:** Searches the internal knowledge base for help articles, troubleshooting guides, and FAQs. Returns the most relevant articles ranked by relevance score. Use this when a customer has a question you're unsure about, when you need to provide official documentation links, or when troubleshooting a technical issue. Do not use this for customer-specific data (account info, billing) — use the appropriate customer lookup tools instead. Avoid searching for overly broad terms like "help" or "problem" — use specific keywords related to the customer's issue.

**Parameters:**
- \`query\` (string, required): The search query. Use specific keywords from the customer's question, e.g., "reset two-factor authentication" rather than "can't log in."
- \`category\` (string, optional): Filter results by category. One of "billing", "technical", "account", "integrations", "getting-started". Omit to search all categories.
- \`max_results\` (number, optional): Maximum number of articles to return. Defaults to 3. Set higher (up to 10) when you need a broader survey of related topics.

**Returns:**
\`\`\`
{
  results: [
    {
      article_id: string,
      title: string,
      summary: string (first 200 characters of the article),
      relevance_score: number (0.0 to 1.0),
      url: string (direct link to the full article),
      last_updated: string (ISO date)
    }
  ],
  total_matches: number,
  suggested_query?: string (alternative query if results are poor)
}
\`\`\``,
  },
};
