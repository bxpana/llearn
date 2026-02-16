import { Lesson } from "@/lib/types";

export const evalDrivenIteration: Lesson = {
  slug: "eval-driven-iteration",
  title: "Eval-Driven Prompt Iteration",
  description:
    "Use eval results to systematically identify failure patterns and make targeted prompt improvements.",
  order: 4,
  content: {
    explanation: `Evals don't just measure quality — they drive improvement. The eval feedback loop works like this:

1. **Run eval** → get scores and failures
2. **Analyze failure patterns** → group failures by type, not individual cases
3. **Diagnose root cause** → why is the prompt producing this pattern?
4. **Make a targeted fix** → change the prompt to address the root cause
5. **Re-run full eval** → verify the fix works AND nothing else broke

The critical insight: **analyze patterns, not individual failures**. If 3 out of 5 failures involve the model being too verbose, that's a pattern with a root cause (the prompt doesn't specify length). If each failure is unique, you may need more diverse test cases or a fundamental prompt redesign.

Common failure patterns and their typical prompt fixes:
- **Too verbose** → add explicit length constraints
- **Wrong format** → add few-shot examples of the correct format
- **Hallucination** → add "only use information from the provided context"
- **Missing edge cases** → add explicit handling instructions for the edge case type
- **Ignoring instructions** → move critical instructions to the end of the prompt or use XML tags to separate them

The biggest mistake: tweaking the prompt based on a single failure without re-running the full eval. This is like fixing a bug without running the test suite — you might fix one thing and break three others.`,
    whyItMatters:
      "Without eval-driven iteration, prompt engineering is trial and error. With it, you have a systematic process: identify the pattern, hypothesize a fix, verify with data. This is the difference between prompt 'tweaking' and prompt engineering. It's also how you demonstrate value to customers — show the score improving over iterations.",
    keyPrinciples: [
      "Analyze failure patterns across test cases, not individual failures",
      "Map each failure pattern to a specific root cause in the prompt",
      "Always re-run the full eval after a change — never assume a fix doesn't break something",
      "Track scores across iterations to show progress and catch regressions",
    ],
  },
  example: {
    scenario:
      "You've run an eval on a customer FAQ response generator and 3 out of 8 test cases failed. You need to diagnose and fix the prompt.",
    bad: {
      userMessage: `Eval result: Test case 4 failed. The model said "I'd recommend upgrading to our Pro plan for $49/month" but the expected answer was about the free plan's features.

Let me fix the prompt by adding: "When asked about the free plan, only discuss free plan features."`,
      assistantResponse: `Updated prompt with the specific instruction about the free plan.

Running just test case 4 again...
- Test 4: ✅ Now discusses free plan features correctly.

Fix verified!`,
      annotations: [
        {
          text: "Test case 4 failed",
          note: "Looking at one failure in isolation. What about the other 2 failures? They might share a root cause.",
        },
        {
          text: "only discuss free plan features",
          note: "Band-aid fix for one case. Doesn't address why the model upsells — it'll happen on other topics too.",
        },
        {
          text: "Running just test case 4 again",
          note: "Only re-ran the failing test! The fix might have broken passing tests (regression).",
        },
      ],
    },
    good: {
      userMessage: `## Eval Results: FAQ Response Generator (Run #3)

**Overall: 5/8 passed (62.5%)**

Failures:
- Test 4: Asked about free plan features → model recommended upgrading to Pro
- Test 6: Asked about cancellation policy → model pitched annual plan benefits instead
- Test 7: Asked how to downgrade → model suggested keeping current plan

Passing tests: 1 (pricing), 2 (setup help), 3 (integration), 5 (refund policy), 8 (team features)

## Pattern Analysis
All 3 failures share a pattern: **the model upsells or redirects instead of directly answering the question**. This happens specifically on questions about lower-tier plans or reducing spend.

## Root Cause
The system prompt says "help customers get the most value from our products" — the model interprets this as a mandate to upsell.

## Proposed Fix
Replace "help customers get the most value from our products" with: "Answer the customer's question directly and completely. Do not suggest upgrades, upsells, or plan changes unless the customer explicitly asks for a recommendation."

## Verification Plan
Re-run all 8 test cases. The 3 failures should pass. The 5 passing tests must still pass (regression check).`,
      assistantResponse: `## Eval Results: FAQ Response Generator (Run #4 — after fix)

**Overall: 8/8 passed (100%)**

- Test 1: ✅ pricing (still passing)
- Test 2: ✅ setup help (still passing)
- Test 3: ✅ integration (still passing)
- Test 4: ✅ free plan features (FIXED — now answers directly)
- Test 5: ✅ refund policy (still passing)
- Test 6: ✅ cancellation policy (FIXED — provides policy without pitching)
- Test 7: ✅ downgrade steps (FIXED — gives clear instructions)
- Test 8: ✅ team features (still passing)

Score improvement: 62.5% → 100%
Fix addressed: Upselling pattern eliminated by changing system prompt directive.
Regression check: All 5 previously passing tests still pass.`,
      annotations: [
        {
          text: "Pattern Analysis",
          note: "Grouped all 3 failures and identified the shared pattern — upselling instead of answering.",
        },
        {
          text: "Root Cause",
          note: "Traced the pattern to a specific line in the system prompt. The fix is targeted, not a band-aid.",
        },
        {
          text: "Re-run all 8 test cases",
          note: "Full eval re-run catches regressions. One targeted fix resolved all 3 failures.",
        },
        {
          text: "62.5% → 100%",
          note: "Tracking score across iterations shows clear progress and validates the approach.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Given the eval results below, perform a failure analysis, identify the root cause, and propose a fix.

**Eval scenario:** A system generates one-paragraph product review summaries. Here are the results:

- Test 1: ✅ Laptop review → accurate summary
- Test 2: ❌ Headphones review → summary mentions "excellent battery life" but the review said "battery life is mediocre"
- Test 3: ✅ Keyboard review → accurate summary
- Test 4: ❌ Smartphone review → summary says "best camera on the market" but the review said "camera is good but not class-leading"
- Test 5: ❌ Tablet review → summary says "perfect for professionals" but the review said "decent for casual use"
- Test 6: ✅ Monitor review → accurate summary

Your analysis should include:
1. The failure pattern (what do the 3 failures have in common?)
2. A root cause diagnosis (why is the prompt producing this pattern?)
3. A specific prompt fix
4. A verification plan (how you'll confirm the fix works)`,
    starterCode: `## Failure Analysis

### Pattern
The 3 failing test cases all share this pattern:
[describe what they have in common]

### Root Cause
The prompt likely causes this because:
[explain why the prompt produces this pattern]

### Proposed Fix
[specific change to the prompt]

### Verification Plan
[how you'll verify the fix works without regressions]`,
    hints: [
      "Compare the failures: in each case, how does the summary differ from the actual review?",
      "Look at the direction of the errors — are they all skewed the same way (more positive, more negative)?",
      "Think about what prompt instruction might cause the model to exaggerate positive sentiment.",
      "Your verification plan should re-run all 6 tests, not just the 3 that failed.",
    ],
    validation: [
      {
        type: "min-length",
        value: 300,
        message:
          "Your analysis needs more detail — cover the pattern, root cause, fix, and verification plan.",
      },
      {
        type: "regex",
        value:
          "[Pp]attern|[Cc]ommon|[Ss]hare|[Aa]ll three|all 3|[Ss]imilar",
        message:
          "Identify the shared pattern across the 3 failing test cases.",
      },
      {
        type: "regex",
        value:
          "[Pp]ositive|[Ee]xagger|[Oo]ver.?stat|[Ii]nflat|[Ss]entiment|[Bb]ias",
        message:
          "Your root cause should identify the direction of the error — the model is exaggerating or skewing sentiment.",
      },
      {
        type: "regex",
        value: "[Ff]ix|[Cc]hange|[Rr]eplace|[Aa]dd|[Rr]emove|[Mm]odif",
        message: "Propose a specific, actionable prompt fix.",
      },
      {
        type: "regex",
        value:
          "[Rr]e.?run|[Aa]ll (6|six)|[Rr]egression|[Ff]ull eval|[Vv]erif",
        message:
          "Your verification plan should include re-running the full eval to check for regressions.",
      },
    ],
    sampleSolution: `## Failure Analysis

### Pattern
The 3 failing test cases all share this pattern: the summary **overstates positive qualities** from the review. In each case, the model inflated neutral or moderate language into strongly positive claims:
- "battery life is mediocre" became "excellent battery life"
- "good but not class-leading" became "best camera on the market"
- "decent for casual use" became "perfect for professionals"

The 3 passing tests (laptop, keyboard, monitor) all had genuinely positive reviews, so the positive bias wasn't visible.

### Root Cause
The prompt likely includes language like "write an engaging summary" or "highlight the product's strengths." The model interprets this as a directive to present the product favorably, which causes it to exaggerate moderate or negative sentiment into positive claims. Essentially, the prompt is biased toward marketing-style language rather than faithful summarization.

### Proposed Fix
Replace any "engaging" or "highlight strengths" language with: "Write a faithful one-paragraph summary that accurately reflects the reviewer's sentiment. Use the same tone as the original review — if the reviewer was critical, the summary should reflect that. Do not exaggerate positive or negative claims. Quote specific language from the review when possible."

Additionally, add: "If the reviewer gave a mixed or negative assessment of a feature, the summary must reflect that mixed or negative assessment."

### Verification Plan
1. Re-run all 6 test cases with the updated prompt
2. The 3 previously failing tests (2, 4, 5) should now accurately reflect the moderate/negative sentiment
3. The 3 previously passing tests (1, 3, 6) must still pass — verify the fix doesn't cause the model to inject false negativity into genuinely positive reviews
4. Track scores: expecting improvement from 50% (3/6) to ≥83% (5/6)
5. If test 2, 4, or 5 still overstate positivity, escalate to adding few-shot examples showing faithful summarization of mixed reviews`,
  },
};
