import { Lesson } from "@/lib/types";

export const promptChaining: Lesson = {
  slug: "prompt-chaining",
  title: "Prompt Chaining",
  description:
    "Break complex tasks into sequential steps where each output feeds into the next.",
  order: 6,
  content: {
    explanation: `Prompt chaining decomposes a complex task into a sequence of simpler prompts, where the output of one step becomes the input for the next. This is powerful because:

- **Each step is simpler** — the model performs better on focused, single-purpose prompts
- **You can validate intermediate results** — catch errors before they compound
- **You can mix strategies** — use different prompting techniques at each step
- **It's debuggable** — when something goes wrong, you know which step failed

A chain might look like:
1. **Extract** — pull relevant information from raw data
2. **Analyze** — reason about the extracted information
3. **Format** — produce the final output in the desired structure

This pattern mirrors how we naturally break down complex work. You wouldn't write an entire report in one sitting — you'd research, outline, draft, then edit.`,
    whyItMatters:
      "Most production LLM applications use prompt chaining. A single prompt trying to do everything — extract, reason, and format — is fragile and hard to debug. Chains are more reliable, more maintainable, and produce better results. They're also the foundation for agent architectures.",
    keyPrinciples: [
      "Each step should have a single, clear responsibility",
      "Pass only the relevant output from one step to the next — don't carry the entire context",
      "Validate intermediate outputs before passing them forward",
      "Design steps so they can be tested and improved independently",
    ],
  },
  example: {
    scenario:
      "You need to analyze customer support tickets to generate a weekly summary report.",
    bad: {
      userMessage: `Here are this week's support tickets. Analyze them, find the top issues, identify trends compared to last week, and write an executive summary with recommendations.

[50 support tickets would go here]
[Last week's summary would go here]`,
      assistantResponse:
        "This week we received 50 support tickets. The top issues were... [long, potentially inconsistent response trying to do everything at once]",
      annotations: [
        {
          text: "Analyze them, find the top issues, identify trends",
          note: "Three separate tasks crammed into one prompt. Each is complex enough to deserve its own step.",
        },
      ],
    },
    good: {
      systemPrompt:
        "This example shows a 3-step prompt chain. In production, each step would be a separate API call.",
      userMessage: `**Step 1: Categorize and Extract**

For each support ticket below, extract:
- Category (billing, bug, feature-request, account, other)
- Severity (low, medium, high)
- One-line summary

Return as a structured list.

<tickets>
[50 support tickets]
</tickets>

---

**Step 2: Analyze Patterns** (receives Step 1 output)

Given these categorized tickets, identify:
1. Top 3 issue categories by volume
2. Any high-severity clusters (3+ tickets on the same issue)
3. Comparison with last week's data

<categorized_tickets>
[Output from Step 1]
</categorized_tickets>

<last_week_summary>
[Last week's data]
</last_week_summary>

---

**Step 3: Write Report** (receives Step 2 output)

Write a 200-word executive summary based on this analysis. Include:
- Key metrics (total tickets, top categories)
- Notable trends or emerging issues
- 2-3 specific recommendations

<analysis>
[Output from Step 2]
</analysis>`,
      assistantResponse: `**Weekly Support Summary — Jan 15-21**

This week we processed 50 support tickets, up 12% from last week's 44.

**Top Issues:**
1. **Billing errors** (14 tickets, 28%) — up from 8 last week, driven by the new pricing rollout
2. **Login failures** (11 tickets, 22%) — steady, related to the known SSO issue
3. **Feature requests** (9 tickets, 18%) — bulk export remains the #1 requested feature

**High-Severity Cluster:** 6 tickets report data sync failures in the EU region since Wednesday's deployment. This appears to be a new regression.

**Recommendations:**
1. **Urgent:** Investigate EU data sync failures — likely related to Wednesday's deployment. Consider a rollback if not resolved by Monday.
2. **This sprint:** Create a billing FAQ or in-app guide for the new pricing — 10 of 14 billing tickets were basic plan questions.
3. **Roadmap:** Prioritize bulk export feature — consistent demand over 4 consecutive weeks.`,
      annotations: [
        {
          text: "Step 1: Categorize and Extract",
          note: "First step is pure extraction — simple, reliable, and produces clean structured data.",
        },
        {
          text: "Step 2: Analyze Patterns",
          note: "Second step receives clean data and focuses only on analysis — no extraction noise.",
        },
        {
          text: "Step 3: Write Report",
          note: "Final step receives analysis and focuses only on clear communication. Each step is debuggable independently.",
        },
        {
          text: "[Output from Step 1]",
          note: "In production code, you'd programmatically pass the actual output from the previous API call here.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Design a 2-step prompt chain for translating and localizing a product description.

**Scenario:** You need to translate a product description from English to Spanish, but you also need to localize it — adapting cultural references, units, and idioms rather than doing a literal translation.

Design two separate prompts:
- **Step 1:** Should handle one specific part of the task
- **Step 2:** Should receive Step 1's output and complete the task

Make sure each step has a clear, single responsibility and that Step 2 explicitly references using the output from Step 1.`,
    starterCode: `Translate this product description to Spanish:

"Our all-American coffee maker brews a perfect 12-cup pot in under 5 minutes.
At just $49.99, it's a home run for any kitchen. Free shipping on orders over $25."`,
    hints: [
      "Step 1 could focus on literal translation, and Step 2 on localization. Or Step 1 could identify what needs localizing, and Step 2 could do the full translation.",
      "Make sure Step 2 explicitly mentions it receives the output from Step 1.",
      "Include the original product description in your chain.",
      "Think about what needs to change for a Spanish-speaking audience: units, idioms ('home run'), currency, cultural references ('all-American').",
    ],
    validation: [
      {
        type: "regex",
        value: "step.?1|first.?(step|prompt)|prompt.?1",
        message: "Clearly label Step 1 of your prompt chain.",
      },
      {
        type: "regex",
        value: "step.?2|second.?(step|prompt)|prompt.?2|next",
        message: "Clearly label Step 2 of your prompt chain.",
      },
      {
        type: "regex",
        value: "output|result|response|from step|from the previous|above",
        message:
          "Step 2 should explicitly reference using the output from Step 1.",
      },
      {
        type: "regex",
        value: "coffee|brew|kitchen|\\$49",
        message: "Include the original product description in your chain.",
      },
      {
        type: "min-length",
        value: 300,
        message:
          "Your prompt chain should include both steps with clear instructions for each.",
      },
    ],
    sampleSolution: `**Step 1: Identify Localization Needs**

Analyze the following English product description and identify elements that need cultural localization for a Latin American Spanish-speaking audience. For each element, note what it is and why it needs adaptation.

Look for: idioms, cultural references, units of measurement, currency, and any culturally-specific phrases.

<product_description>
Our all-American coffee maker brews a perfect 12-cup pot in under 5 minutes. At just $49.99, it's a home run for any kitchen. Free shipping on orders over $25.
</product_description>

Return a list in this format:
- Original phrase → Why it needs localization → Suggested adaptation

---

**Step 2: Translate and Localize**

Using the localization analysis from Step 1, create a fully localized Spanish translation of this product description.

<original>
Our all-American coffee maker brews a perfect 12-cup pot in under 5 minutes. At just $49.99, it's a home run for any kitchen. Free shipping on orders over $25.
</original>

<localization_notes>
[Output from Step 1]
</localization_notes>

Instructions:
- Apply all the localization adaptations identified in the analysis
- Ensure the translation sounds natural to a Latin American Spanish speaker, not a literal word-for-word translation
- Keep the same enthusiastic marketing tone as the original
- Return the final localized Spanish text only`,
  },
};
