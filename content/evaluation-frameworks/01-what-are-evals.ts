import { Lesson } from "@/lib/types";

export const whatAreEvals: Lesson = {
  slug: "what-are-evals",
  title: "What Are Evals",
  description:
    "Understand the three components of any eval and why subjective judgment doesn't scale.",
  order: 1,
  content: {
    explanation: `An eval (evaluation) is a systematic way to measure how well an LLM performs a specific task. Every eval has three components:

1. **Test inputs** — a set of representative inputs the model will process
2. **System under test** — the prompt + model configuration you're evaluating
3. **Scoring criteria** — how you determine whether each output is good, acceptable, or failing

Without evals, teams rely on "it looks good to me" — a developer eyeballs a few outputs and declares the prompt ready. This breaks down fast:

- **Inconsistency** — different reviewers have different standards
- **Coverage gaps** — manual review misses edge cases
- **Regression blindness** — you can't tell if a prompt change broke something that used to work
- **No baseline** — you can't compare two approaches objectively

Evals turn subjective quality judgment into a repeatable, measurable process. They're the foundation of any production LLM system.`,
    whyItMatters:
      "Every production LLM deployment needs a way to answer 'is this good enough?' before shipping and 'is it still good enough?' after changes. Evals give you that answer with data instead of gut feeling. As an SA, helping customers set up their first eval is often the highest-leverage thing you can do.",
    keyPrinciples: [
      "Every eval has three parts: test inputs, system under test, and scoring criteria",
      "Manual spot-checking doesn't scale — evals make quality measurement repeatable",
      "Start with a small eval (5-10 test cases) rather than waiting for a perfect dataset",
      "An eval spec should be written before optimizing prompts, not after",
    ],
  },
  example: {
    scenario:
      "A team is building a support ticket classifier and wants to check if their prompt works.",
    bad: {
      userMessage: `Classify this support ticket:

"I can't log in to my account. I've tried resetting my password three times and it still doesn't work."

Categories: billing, technical, account, feature-request`,
      assistantResponse: `Category: account

This ticket is about an account access issue where the customer is unable to log in despite multiple password reset attempts.`,
      annotations: [
        {
          text: "Category: account",
          note: "Testing one ticket tells you nothing about overall quality. What about ambiguous tickets? Multi-category tickets?",
        },
        {
          text: "This ticket is about an account access issue",
          note: "Reading one good output creates false confidence. The next ticket might be completely wrong.",
        },
      ],
    },
    good: {
      userMessage: `## Eval Spec: Support Ticket Classifier

**System under test:** Classification prompt with categories: billing, technical, account, feature-request

**Test cases:**
1. "I can't log in after resetting my password" → Expected: account
2. "I was charged twice for my subscription" → Expected: billing
3. "The app crashes when I upload a PDF" → Expected: technical
4. "It would be great if you supported dark mode" → Expected: feature-request
5. "I can't log in and I was also charged twice" → Expected: account (primary)

**Scoring criteria:**
- Exact match on primary category: pass/fail
- Eval passes if ≥4 out of 5 test cases score "pass"

**Known edge cases to monitor:**
- Multi-category tickets (test case 5)
- Tickets where category is ambiguous`,
      assistantResponse: `Results:
- Test 1: ✅ account (correct)
- Test 2: ✅ billing (correct)
- Test 3: ✅ technical (correct)
- Test 4: ✅ feature-request (correct)
- Test 5: ❌ billing (expected: account)

Score: 4/5 (80%) — PASS (threshold: 80%)

Failure analysis: Multi-category tickets default to the most recent issue mentioned rather than the primary intent.`,
      annotations: [
        {
          text: "Eval Spec: Support Ticket Classifier",
          note: "A written spec makes the eval reproducible — anyone on the team can run it and get the same results.",
        },
        {
          text: "Test cases:",
          note: "Five diverse test cases covering all categories plus an edge case. Small but meaningful.",
        },
        {
          text: "Scoring criteria:",
          note: "Clear pass/fail definition with an aggregate threshold — no ambiguity about what 'good' means.",
        },
        {
          text: "Failure analysis:",
          note: "The eval pinpoints exactly where and why the prompt fails, enabling targeted fixes.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write an eval spec for an email classifier.

The system classifies incoming emails into: inquiry, complaint, urgent, spam.

Your eval spec must include:
- At least 4 test cases with expected categories
- At least one edge case (ambiguous or multi-category email)
- Scoring criteria with a pass/fail definition
- An overall pass threshold

Write it as a structured document — use headings, numbered test cases, and clear criteria.`,
    starterCode: `## Eval Spec: Email Classifier

**System under test:** [describe the system]

**Test cases:**
1. [input] → Expected: [category]

**Scoring criteria:**
[how you score each test case]

**Pass threshold:**
[what overall score means the eval passes]`,
    hints: [
      "Cover all four categories with at least one test case each.",
      "Think about edge cases: what if an email is both urgent AND a complaint?",
      "Define whether scoring is exact match only or allows partial credit.",
      "Set a realistic threshold — 100% on 4 tests is different from 100% on 40 tests.",
    ],
    validation: [
      {
        type: "min-length",
        value: 300,
        message:
          "Your eval spec needs more detail — include all test cases, scoring criteria, and a threshold.",
      },
      {
        type: "regex",
        value: "inquiry|complaint|urgent|spam",
        message:
          "Include test cases that cover the email categories (inquiry, complaint, urgent, spam).",
      },
      {
        type: "regex",
        value: "[Tt]est [Cc]ase|\\d+\\.",
        message:
          "List your test cases with numbers or labels so they're easy to reference.",
      },
      {
        type: "regex",
        value:
          "[Ss]cor(e|ing)|[Pp]ass|[Ff]ail|[Tt]hreshold|[Cc]riter(ia|ion)",
        message:
          "Define scoring criteria — how do you determine pass vs. fail for each test case?",
      },
      {
        type: "regex",
        value: "edge|ambig|multi|overlap|both|tricky",
        message:
          "Include at least one edge case — an ambiguous or multi-category email.",
      },
    ],
    sampleSolution: `## Eval Spec: Email Classifier

**System under test:** Email classification prompt that assigns one of four categories: inquiry, complaint, urgent, spam.

**Test cases:**

1. "Hi, I'd like to know your pricing for the enterprise plan. Can you send me a quote?" → Expected: inquiry
2. "I've been waiting 3 weeks for my refund and nobody has responded to my emails. This is unacceptable." → Expected: complaint
3. "CRITICAL: Our production system is down and we're losing revenue every minute. Need immediate assistance." → Expected: urgent
4. "Congratulations! You've won a $1,000 gift card. Click here to claim your prize now!!!" → Expected: spam
5. "I'm extremely frustrated — your system has been down for 2 hours and our team can't work. I need this escalated immediately." → Expected: urgent (edge case: both complaint and urgent — urgency takes priority)
6. "Quick question: do you offer refunds? I bought the wrong plan and I'm a bit disappointed with the process." → Expected: inquiry (edge case: ambiguous between inquiry and complaint — primary intent is asking a question)

**Scoring criteria:**
- Exact match on expected category: pass
- Any other category: fail
- For edge cases (5, 6): accept either noted category as pass

**Pass threshold:**
- Overall: ≥5 out of 6 test cases pass (83%)
- Urgent category: 100% recall required (test case 3 and 5 must both pass)`,
  },
};
