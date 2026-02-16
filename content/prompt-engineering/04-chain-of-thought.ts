import { Lesson } from "@/lib/types";

export const chainOfThought: Lesson = {
  slug: "chain-of-thought",
  title: "Chain-of-Thought Reasoning",
  description:
    "Improve accuracy on complex tasks by asking the model to reason step by step.",
  order: 4,
  content: {
    explanation: `Chain-of-thought (CoT) prompting asks the model to show its reasoning before giving a final answer. This dramatically improves performance on tasks that require:

- **Multi-step logic** — math, planning, debugging
- **Analysis** — comparing options, weighing tradeoffs
- **Complex classification** — where the answer depends on multiple factors

The key insight: when you force the model to "think out loud," it catches errors it would otherwise make when jumping directly to an answer. The intermediate reasoning steps act as a scaffold for the final conclusion.

There are two main approaches:
- **Explicit instruction** — add "Think step by step" or "Show your reasoning"
- **Structured reasoning** — provide a reasoning framework like "First analyze X, then consider Y, finally conclude Z"`,
    whyItMatters:
      "CoT is essential for any LLM application that involves reasoning, decision-making, or analysis. Without it, models often pattern-match to a plausible-sounding but wrong answer. With CoT, accuracy on reasoning tasks can improve by 30-50%. It also makes outputs auditable — you can verify the reasoning, not just the answer.",
    keyPrinciples: [
      "Ask for reasoning BEFORE the final answer — order matters",
      "Use structured frameworks for complex decisions: 'Analyze the pros, then the cons, then recommend'",
      "CoT is most valuable for hard tasks — for simple lookups, it just adds unnecessary tokens",
      "You can use XML tags like <thinking> to separate reasoning from the final answer",
    ],
  },
  example: {
    scenario:
      "You need the model to determine which pricing plan is best for a customer based on their usage.",
    bad: {
      userMessage: `Which pricing plan should this customer use?

Customer details:
- 5 team members
- 10,000 API calls/month
- Needs priority support
- Budget: $200/month

Plans:
- Starter: $49/mo, 3 users, 5,000 API calls, email support
- Pro: $149/mo, 10 users, 50,000 API calls, priority support
- Enterprise: $399/mo, unlimited users, unlimited API calls, dedicated support`,
      assistantResponse:
        "I'd recommend the Pro plan at $149/month. It fits within the budget, supports up to 10 users, includes 50,000 API calls, and comes with priority support.",
      annotations: [
        {
          text: "I'd recommend the Pro plan",
          note: "Correct answer, but HOW did it decide? Without reasoning, you can't verify the logic or catch errors on harder cases.",
        },
      ],
    },
    good: {
      userMessage: `Which pricing plan should this customer use? Think through each plan step by step, checking all requirements, before making a recommendation.

Customer details:
- 5 team members
- 10,000 API calls/month
- Needs priority support
- Budget: $200/month

Plans:
- Starter: $49/mo, 3 users, 5,000 API calls, email support
- Pro: $149/mo, 10 users, 50,000 API calls, priority support
- Enterprise: $399/mo, unlimited users, unlimited API calls, dedicated support

For each plan, evaluate: (1) Does it meet the user requirement? (2) Is it within budget? Then give your recommendation.`,
      assistantResponse: `<thinking>
**Starter plan ($49/mo):**
1. Users: Need 5, plan allows 3 — ❌ Does not meet requirement
2. Budget: $49 < $200 — ✅ Within budget
→ Eliminated: insufficient user seats

**Pro plan ($149/mo):**
1. Users: Need 5, plan allows 10 — ✅ Meets requirement
2. API calls: Need 10,000, plan allows 50,000 — ✅ Meets requirement
3. Support: Need priority, plan includes priority — ✅ Meets requirement
4. Budget: $149 < $200 — ✅ Within budget
→ All requirements met

**Enterprise plan ($399/mo):**
1. Users: unlimited — ✅ Meets requirement
2. API calls: unlimited — ✅ Meets requirement
3. Support: dedicated (exceeds need) — ✅ Meets requirement
4. Budget: $399 > $200 — ❌ Exceeds budget
→ Eliminated: over budget
</thinking>

**Recommendation: Pro plan ($149/mo)**

It's the only plan that meets all four requirements: 5+ user seats, 10,000+ API calls, priority support, and under $200/month. It also leaves $51/month of headroom for growth.`,
      annotations: [
        {
          text: "Think through each plan step by step",
          note: "Explicit instruction to reason before answering.",
        },
        {
          text: "For each plan, evaluate:",
          note: "Structured reasoning framework — tells the model exactly what to check.",
        },
        {
          text: "<thinking>",
          note: "XML tags separate the reasoning from the final answer — easy to parse programmatically.",
        },
        {
          text: "leaves $51/month of headroom",
          note: "The step-by-step process surfaces useful details that a direct answer would miss.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Add chain-of-thought reasoning to a debugging prompt.

The scenario: A developer asks the model to find the bug in a code snippet. Without CoT, the model might jump to an answer and miss the real issue.

Rewrite the prompt below to include chain-of-thought reasoning. Your prompt should ask the model to:
1. Analyze the code step by step
2. Identify what each part does
3. Find the bug with explanation
4. Suggest a fix

Original prompt: *"Find the bug in this code: [code snippet]"*`,
    starterCode: `Find the bug in this code:

function calculateDiscount(price, discount) {
  if (discount > 1) {
    return price * discount;
  }
  return price - (price * discount);
}`,
    hints: [
      "Add an instruction like 'Analyze this code step by step before identifying the bug.'",
      "Ask the model to trace through the code with specific inputs to find where it breaks.",
      "Use a structured format: 'First, describe what the code does. Then, trace through with an example. Finally, identify the bug and suggest a fix.'",
      "Consider using <thinking> tags to separate analysis from the final answer.",
    ],
    validation: [
      {
        type: "regex",
        value: "step.by.step|think|analy|trace|walk.through|reason|before|first.*then",
        message:
          "Include an instruction to reason step by step before giving the answer.",
      },
      {
        type: "regex",
        value: "calculateDiscount|price|discount",
        message: "Include the original code snippet in your prompt.",
      },
      {
        type: "min-length",
        value: 200,
        message:
          "Your prompt should include the code plus detailed reasoning instructions.",
      },
      {
        type: "regex",
        value: "bug|issue|error|problem|fix|correct|wrong",
        message: "Ask the model to identify the bug and suggest a fix.",
      },
    ],
    sampleSolution: `Analyze the following code step by step to find and fix the bug.

\`\`\`javascript
function calculateDiscount(price, discount) {
  if (discount > 1) {
    return price * discount;
  }
  return price - (price * discount);
}
\`\`\`

Please work through this systematically:

1. **Describe the function's intent** — what is it supposed to do?
2. **Trace through with examples** — try calculateDiscount(100, 0.2) and calculateDiscount(100, 20). What does each return?
3. **Identify the bug** — where does the logic break down? What assumption is wrong?
4. **Suggest a fix** — provide the corrected code with an explanation of what you changed.

Show your reasoning in <thinking> tags before giving the final answer.`,
  },
};
