import { Lesson } from "@/lib/types";

export const multiAgent: Lesson = {
  slug: "multi-agent",
  title: "Multi-Agent Orchestration",
  description:
    "Design systems with multiple specialized agents coordinated by a router or supervisor pattern.",
  order: 6,
  content: {
    explanation: `As agent tasks grow in scope, a single agent with one massive system prompt becomes unreliable. A system prompt that tries to cover order tracking, technical support, billing inquiries, returns processing, and account management ends up being thousands of tokens of instructions that the model struggles to follow consistently. Multi-agent orchestration solves this by splitting responsibilities across focused agents, each with a clear domain.

**When Multiple Agents Help**

A single agent is fine when the task domain is narrow and the system prompt fits comfortably in one context. Multi-agent becomes valuable when:

- **Domain breadth** — the system needs expertise in 3+ distinct areas that each require different tools, instructions, and behavioral rules. A single prompt can't do justice to all of them.
- **Conflicting instructions** — different tasks require different behaviors. A sales agent should be enthusiastic and proactive; a compliance agent should be cautious and precise. Putting both behaviors in one prompt creates confusion.
- **Context window pressure** — each domain requires extensive instructions, examples, and tool definitions. Splitting across agents keeps each context window focused.
- **Independent scaling** — different domains have different load patterns. Billing gets 10x traffic on invoice day. Separating agents allows independent scaling and optimization.

**Orchestration Patterns**

There are three primary patterns for coordinating multiple agents:

**1. Router Pattern** — A lightweight router agent receives the user's request, classifies it, and forwards it to the appropriate specialized agent. The router has minimal instructions — just enough to categorize and route. Each specialized agent handles its domain end-to-end. This is the simplest and most common pattern.

**2. Supervisor Pattern** — A supervisor agent manages the overall task, delegates subtasks to specialized agents, collects their results, and synthesizes a final response. The supervisor maintains the high-level plan while workers handle execution. This is useful for complex tasks that span multiple domains.

**3. Pipeline Pattern** — Agents are arranged in a sequence where each agent's output becomes the next agent's input. Agent A researches, Agent B analyzes, Agent C writes. Each agent is specialized for one stage. This works well when the task has clear sequential phases.

**Context Passing Between Agents**

The biggest challenge in multi-agent systems is context management. When the router sends a request to a specialized agent, what context does the specialized agent receive?

- **Minimal context** — only the user's message and the routing decision. Simple but the specialized agent may lack crucial history.
- **Summarized context** — the router summarizes the relevant conversation history. Efficient but risks losing important details.
- **Full context** — the entire conversation passes to the specialized agent. Complete but expensive and may include irrelevant information.
- **Structured handoff** — the router extracts specific fields (customer_id, issue_type, previous_attempts) and passes them in a structured format. This is the most reliable approach — it ensures the specialized agent gets exactly what it needs.

**Shared State**

Agents in a multi-agent system often need to share state: customer records, conversation history, task progress, and intermediate results. Implement shared state through:

- **A shared context object** passed between agents with relevant fields
- **A database or state store** that agents read from and write to
- **Explicit handoff messages** where the outgoing agent summarizes its work for the incoming agent

Avoid hidden shared state where agents implicitly depend on side effects of other agents. Every piece of shared state should be explicitly read and written through defined interfaces.`,
    whyItMatters:
      "Real-world applications often span multiple domains that each require specialized knowledge and different tools. Trying to cram everything into one agent produces a system that's mediocre at everything. Multi-agent orchestration lets you build focused, testable, maintainable agents that each excel at their domain, while the orchestration layer handles routing and coordination.",
    keyPrinciples: [
      "Consider multi-agent when a single system prompt must serve 3+ distinct domains with conflicting behavioral instructions — prompt complexity, not just length, is the driver",
      "Choose your orchestration pattern based on the task structure: router for classification, supervisor for complex coordination, pipeline for sequential processing",
      "Pass context between agents through structured handoff objects with explicit fields, not raw conversation dumps",
      "Every piece of shared state should be explicitly defined — avoid agents depending on implicit side effects of other agents",
    ],
  },
  example: {
    scenario:
      "A team is building a customer support system that handles order tracking, technical support, and billing inquiries.",
    bad: {
      systemPrompt: `You are an all-in-one customer support agent. You handle everything.

## Order Tracking
When customers ask about orders, look up their order using get_order_status. If the order is delayed, check the shipping carrier with check_carrier_status. Offer to send tracking updates via send_notification. If the order is lost, initiate a replacement with create_replacement_order. Always check the customer's order history first with get_order_history to see if they're a frequent buyer and adjust your tone accordingly.

## Technical Support
When customers have technical issues, first ask for their product model and firmware version. Use get_device_diagnostics to run remote checks. If the diagnostic shows a hardware issue, schedule a repair with schedule_repair. If it's a software issue, search for solutions with search_tech_kb and walk them through the fix. For critical outages affecting multiple users, escalate immediately with create_p1_incident.

## Billing
When customers have billing questions, pull their billing history with get_billing_history. For refund requests, check eligibility with check_refund_eligibility before processing with process_refund. Never process refunds over $200 without supervisor approval (use request_approval). For subscription changes, use update_subscription. Always calculate proration correctly — use calculate_proration for mid-cycle changes.

## Returns
When customers want to return a product, check the return window with check_return_eligibility. Generate a return label with create_return_label. For electronics returns, always ask if they've backed up their data first. If the return is past the window, offer store credit as an alternative using apply_store_credit.

## Account Management
Handle password resets with reset_password. For account deletion requests, verify identity with verify_identity, then use initiate_account_deletion. For GDPR requests, transfer to the legal team immediately. Update contact info with update_account.

Remember to be helpful, professional, and empathetic. Use the customer's name. If you're unsure about anything, ask for clarification.`,
      userMessage: `Customer (ID: cust_8812) says: "I was charged twice for my subscription this month."`,
      assistantResponse: `I'm sorry to hear about the double charge! Let me look into this right away.

[Calling get_billing_history("cust_8812")]
Result: { charges: [{ date: "2024-03-01", amount: 29.99, desc: "Pro Plan" }, { date: "2024-03-01", amount: 29.99, desc: "Pro Plan" }] }

I can see you were indeed charged twice — $29.99 on March 1st, appearing twice. Let me check your refund eligibility.

[Calling check_refund_eligibility("cust_8812", 29.99)]
Result: { eligible: true, reason: "duplicate_charge" }

You're eligible for a refund. Let me process that for you.

[Calling process_refund("cust_8812", 29.99, "duplicate_charge")]
Result: { success: true, refund_id: "ref_3341" }

Your refund of $29.99 has been processed (Reference: ref_3341). You should see it in your account within 3-5 business days. Is there anything else I can help with?`,
      annotations: [
        {
          text: "You are an all-in-one customer support agent. You handle everything.",
          note: "This system prompt is ~450 words across 5 domains with 15+ tools. The model must hold all instructions in context for every interaction, even though each conversation only uses one domain.",
        },
        {
          text: "## Order Tracking",
          note: "This specific interaction is about billing, but the agent is carrying instructions for order tracking, tech support, returns, and account management — all irrelevant context that increases cost and reduces reliability.",
        },
        {
          text: "I can see you were indeed charged twice",
          note: "The response is fine for this simple case, but the mega-prompt approach will fail on complex cases where billing-specific nuances conflict with the general 'be helpful' instruction.",
        },
      ],
    },
    good: {
      systemPrompt: `## Router Agent

You are a routing agent for customer support. Your ONLY job is to classify incoming requests and route them to the correct specialized agent. Do NOT attempt to answer the customer's question directly.

### Classification Categories
- **billing** — charges, refunds, subscription changes, invoices, payment methods
- **orders** — order status, tracking, delivery issues, replacements
- **technical** — product issues, troubleshooting, diagnostics, outages
- **account** — password resets, profile updates, account deletion, privacy requests

### Routing Instructions
1. Read the customer's message
2. Classify into one of the four categories
3. Extract the structured handoff context (see format below)
4. Route to the specialized agent

If the request spans multiple categories (e.g., "I was charged for an order I returned"), route to the PRIMARY concern (billing in this case) and include the secondary concern in the handoff context.

### Handoff Format
\`\`\`
{
  route_to: "billing" | "orders" | "technical" | "account",
  customer_id: string,
  issue_summary: string,
  priority: "normal" | "high" | "urgent",
  secondary_concerns: string[],
  relevant_ids: { order_id?: string, ticket_id?: string }
}
\`\`\`

---

## Billing Agent (receives routed billing requests)

You are a billing support specialist. You ONLY handle billing-related issues: charges, refunds, subscriptions, invoices, and payment methods.

### Available Tools
- get_billing_history(customer_id) — retrieves all charges and payments
- check_refund_eligibility(customer_id, amount) — checks if a refund can be processed
- process_refund(customer_id, amount, reason) — processes an approved refund
- update_subscription(customer_id, plan, cycle) — changes subscription plan or billing cycle
- calculate_proration(customer_id, new_plan) — calculates mid-cycle cost adjustments
- request_approval(customer_id, action, amount) — requests supervisor approval for large refunds

### Behavioral Rules
- Process refunds up to $200 autonomously. Above $200, use request_approval first.
- Always verify duplicate charges by checking billing_history before processing refunds.
- For subscription changes, always show the customer the proration calculation before applying.`,
      userMessage: `Customer (ID: cust_8812) says: "I was charged twice for my subscription this month."`,
      assistantResponse: `**Router Agent:**

Classifying request: The customer reports a duplicate charge — this is a billing issue.

Handoff:
\`\`\`
{
  route_to: "billing",
  customer_id: "cust_8812",
  issue_summary: "Customer reports duplicate subscription charge this month",
  priority: "high",
  secondary_concerns: [],
  relevant_ids: {}
}
\`\`\`

Routing to Billing Agent...

---

**Billing Agent:**

I received a high-priority billing case: duplicate subscription charge for customer cust_8812. Let me investigate.

[Calling get_billing_history("cust_8812")]
Result: { charges: [{ date: "2024-03-01", amount: 29.99, desc: "Pro Plan", charge_id: "ch_901" }, { date: "2024-03-01", amount: 29.99, desc: "Pro Plan", charge_id: "ch_902" }] }

Confirmed: two identical charges of $29.99 on March 1st with different charge IDs (ch_901, ch_902). This is a duplicate charge, not a legitimate double billing. Checking refund eligibility.

[Calling check_refund_eligibility("cust_8812", 29.99)]
Result: { eligible: true, reason: "duplicate_charge", auto_approve: true }

Eligible for automatic refund (under $200 threshold). Processing.

[Calling process_refund("cust_8812", 29.99, "duplicate_charge")]
Result: { success: true, refund_id: "ref_3341", estimated_arrival: "3-5 business days" }

I've confirmed the duplicate charge and processed your refund. Here's a summary:

- **Duplicate charge:** $29.99 on March 1st (charge ch_902)
- **Refund:** $29.99 → Reference ref_3341
- **Timeline:** 3-5 business days to appear on your statement

Your subscription remains active on the Pro Plan at $29.99/month. The next regular charge will be April 1st. Is there anything else about your billing I can help with?`,
      annotations: [
        {
          text: "## Router Agent",
          note: "The router is lightweight — it classifies and passes structured context. It doesn't try to answer the question, keeping its instructions short and focused.",
        },
        {
          text: "### Handoff Format",
          note: "Structured handoff with explicit fields ensures the billing agent gets exactly the context it needs — customer ID, issue summary, priority — without irrelevant conversation history.",
        },
        {
          text: "## Billing Agent",
          note: "The billing agent has only billing tools and billing rules. Its system prompt is ~150 words instead of ~450. Focused context means more reliable behavior.",
        },
        {
          text: "under $200 threshold",
          note: "The billing agent can apply its domain-specific rules (auto-approve under $200) without conflicting instructions from other domains. Each specialized agent has clean, testable logic.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design a multi-agent architecture for an e-commerce assistant. The system needs to handle:

1. **Product recommendations** — helping customers find products
2. **Order management** — tracking, returns, cancellations
3. **Account support** — profile updates, password resets, preferences

Your design must include:
- **Router agent** — classification logic and handoff format
- **3 specialized agents** — each with their own tools, instructions, and behavioral rules
- **Context passing** — how information flows between the router and specialists
- **Edge cases** — how to handle requests that span multiple domains

Write this as a system design document that a developer could implement.`,
    starterCode: `## E-Commerce Multi-Agent Architecture

### Router Agent
**Purpose:** [classify and route requests]
**Classification categories:** [list the categories]
**Handoff format:**
\`\`\`
{ [structured context object] }
\`\`\`

### Specialist: Product Recommendations Agent
**Tools:** [list tools]
**Instructions:** [behavioral rules]

### Specialist: Order Management Agent
**Tools:** [list tools]
**Instructions:** [behavioral rules]

### Specialist: Account Support Agent
**Tools:** [list tools]
**Instructions:** [behavioral rules]

### Context Passing
[how information flows between agents]

### Edge Cases
[multi-domain requests, unknown categories, agent handoffs]`,
    hints: [
      "The router should be simple — classify into one of 3 categories and extract a structured handoff object with customer ID, intent, and relevant IDs.",
      "Each specialist needs 3-4 tools specific to their domain. Don't give a specialist tools from another domain.",
      "For context passing, define a specific handoff object format with typed fields — don't just pass raw conversation text.",
      "Multi-domain requests (e.g., 'return this and recommend something better') should route to the primary concern with the secondary noted in the handoff.",
    ],
    validation: [
      {
        type: "min-length",
        value: 600,
        message:
          "Your architecture needs more detail — include the router, all 3 specialists, context passing, and edge cases.",
      },
      {
        type: "regex",
        value: "[Rr]outer|[Cc]lassif|[Rr]out(e|ing)",
        message:
          "Include a router agent that classifies and routes incoming requests.",
      },
      {
        type: "regex",
        value: "[Pp]roduct|[Rr]ecommend",
        message:
          "Include a product recommendations specialist agent with its own tools and instructions.",
      },
      {
        type: "regex",
        value: "[Oo]rder|[Tt]rack|[Rr]eturn",
        message:
          "Include an order management specialist agent with its own tools and instructions.",
      },
      {
        type: "regex",
        value: "[Aa]ccount|[Pp]rofile|[Pp]assword",
        message:
          "Include an account support specialist agent with its own tools and instructions.",
      },
      {
        type: "regex",
        value: "[Hh]andoff|[Cc]ontext|[Pp]ass(ing|ed)|[Ss]hared|[Ff]ormat",
        message:
          "Define how context is passed between the router and specialist agents.",
      },
    ],
    sampleSolution: `## E-Commerce Multi-Agent Architecture

### Router Agent

**Purpose:** Receive all incoming customer messages, classify the intent, and route to the appropriate specialist agent. The router NEVER answers questions directly — it only classifies and routes.

**Classification Categories:**
- **product_recommendations** — product search, suggestions, comparisons, "help me find," wishlists
- **order_management** — order status, tracking, returns, cancellations, delivery issues, exchanges
- **account_support** — login issues, password reset, profile updates, email/address changes, preferences, account deletion

**Classification Rules:**
1. Read the customer's message and identify the primary intent
2. If the message contains multiple intents (e.g., "track my order and recommend similar items"), route to the PRIMARY intent and include secondary intents in the handoff
3. If the intent is unclear, ask one clarifying question before routing: "I'd like to help — are you looking for product recommendations, help with an order, or account assistance?"
4. If the intent doesn't match any category (e.g., "what's the weather?"), respond: "I'm an e-commerce assistant and can help with product recommendations, orders, and account management. Which of these can I help with?"

**Handoff Format:**
\`\`\`
{
  route_to: "product_recommendations" | "order_management" | "account_support",
  customer_id: string,
  intent_summary: string,
  priority: "normal" | "high" | "urgent",
  secondary_intents: string[],
  extracted_ids: {
    order_id?: string,
    product_id?: string,
    ticket_id?: string
  },
  customer_context: {
    is_authenticated: boolean,
    membership_tier?: "standard" | "premium" | "vip"
  }
}
\`\`\`

Priority rules: "urgent" for lost packages or locked accounts, "high" for refund requests or frustrated customers, "normal" for everything else.

---

### Specialist: Product Recommendations Agent

**Tools:**
- \`search_products(query: string, filters?: { category?: string, price_min?: number, price_max?: number, in_stock?: boolean })\` — search the product catalog with optional filters
- \`get_product_details(product_id: string)\` — get full details, specs, and reviews for a specific product
- \`get_purchase_history(customer_id: string, limit?: number)\` — retrieve recent purchases to inform recommendations
- \`get_browsing_context(customer_id: string)\` — get recently viewed items and wishlist for personalization

**Instructions:**
- Always check purchase history and browsing context before making recommendations to avoid suggesting items the customer already owns.
- Recommend 2-4 products per query. For each, explain WHY it matches what the customer is looking for — don't just list products.
- If the customer's request is vague ("something nice for my mom"), ask targeted questions: occasion, budget, recipient's interests. Maximum 2 clarifying questions before providing initial suggestions.
- Never recommend out-of-stock items unless the customer specifically asks about a product. Always include in_stock: true in search filters.
- For comparison requests, present a structured comparison with pros/cons for each option. Don't just pick a winner unless asked.
- If no products match the customer's criteria, suggest the closest alternatives and explain what tradeoffs they'd be making.

---

### Specialist: Order Management Agent

**Tools:**
- \`get_order_status(order_id: string)\` — get current status, tracking, and estimated delivery
- \`get_order_history(customer_id: string)\` — list all orders for the customer
- \`initiate_return(order_id: string, items: string[], reason: string)\` — start a return process and generate return label
- \`cancel_order(order_id: string, reason: string)\` — cancel an order (only works for orders not yet shipped)
- \`create_replacement(order_id: string, items: string[], reason: string)\` — create a replacement order for damaged/lost items
- \`contact_carrier(tracking_number: string, issue: string)\` — open an investigation with the shipping carrier

**Instructions:**
- For order tracking, always show: current status, tracking number (if available), and estimated delivery date.
- For returns, check that the order is within the 30-day return window before initiating. If outside the window, explain the policy and offer to connect with a supervisor for exceptions.
- For cancellations, verify the order hasn't shipped yet. If it has shipped, offer the return process instead and explain why cancellation isn't possible.
- For lost packages: if the tracking shows "delivered" but the customer says they didn't receive it, initiate a carrier investigation with contact_carrier AND create a replacement. Don't make the customer wait for the investigation.
- Never promise specific refund timelines shorter than what the system provides. Standard is 5-7 business days for refunds.
- For VIP customers (membership_tier: "vip" in handoff context), offer expedited replacement shipping at no charge.

---

### Specialist: Account Support Agent

**Tools:**
- \`get_account_details(customer_id: string)\` — retrieve account profile, preferences, and security settings
- \`send_password_reset(customer_id: string)\` — send a password reset email to the registered address
- \`update_profile(customer_id: string, fields: { name?: string, email?: string, phone?: string, address?: object })\` — update account information
- \`update_preferences(customer_id: string, preferences: { notifications?: object, communication?: object, privacy?: object })\` — update notification and privacy preferences
- \`verify_identity(customer_id: string, method: "email" | "phone" | "security_questions")\` — verify the customer's identity for sensitive operations

**Instructions:**
- For password resets, always use send_password_reset. Never set a password directly. Confirm which email address will receive the reset link.
- For email address changes, REQUIRE identity verification via verify_identity before making the change. This prevents account takeover.
- For address changes, identity verification is recommended but not required. Simply confirm the new address with the customer before applying.
- For account deletion requests, verify identity first, then explain: data will be permanently removed within 30 days, active orders will still be fulfilled, and this action cannot be undone. If the customer confirms, create a ticket for the deletion team rather than attempting to delete directly.
- For GDPR/privacy data export requests, create a ticket for the privacy team. Do not attempt to handle these directly. Inform the customer they'll receive their data export within 30 days as required by regulation.
- Never display full credit card numbers, SSNs, or full passwords. Show only masked versions (last 4 digits).

---

### Context Passing

**Router to Specialist:**
Context flows via the structured handoff object defined above. The specialist receives ONLY:
1. The handoff object (structured fields)
2. The customer's original message
3. The last 3 messages of conversation history (if any)

The specialist does NOT receive the router's internal classification reasoning or other specialists' conversations.

**Specialist to Router (return routing):**
If a specialist determines the request belongs to a different domain during the conversation, it routes back through the router with:
\`\`\`
{
  reroute_to: "order_management",
  reason: "Customer initially asked about account but needs help tracking an order",
  context_summary: "Verified identity, customer actually needs order #ORD-5523 status",
  customer_id: "cust_8812"
}
\`\`\`

**Shared State:**
All agents read from and write to a shared customer context store:
- Customer profile (read by all agents)
- Conversation summary (written after each specialist interaction)
- Open tickets and pending actions (read by all agents to avoid duplicates)

---

### Edge Cases

**Multi-domain requests:** "I want to return my headphones and get a recommendation for better ones."
- Router routes to order_management (primary: return) with secondary_intents: ["product_recommendations"]
- Order management agent processes the return, then re-routes to product recommendations with context: "Customer returning wireless headphones due to poor sound quality — looking for an upgrade"

**Unknown category:** "Can you tell me about your company's sustainability practices?"
- Router responds: "I specialize in product recommendations, orders, and account management. For information about our sustainability practices, I'd recommend visiting our About page at [link]. Is there anything else I can help with in those areas?"

**Agent handoff mid-conversation:** When one specialist needs to transfer to another:
1. Current specialist summarizes what was accomplished and what's still needed
2. Handoff includes the summary plus any relevant IDs or data gathered
3. New specialist acknowledges the transfer: "I see you've already started a return — let me help with the product recommendation now"

**Customer escalation:** Any specialist can escalate to a human by creating a priority ticket with full conversation context. The ticket includes: customer ID, issue summary, what was tried, what failed, and recommended next steps for the human agent.`,
  },
};
