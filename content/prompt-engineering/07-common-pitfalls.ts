import { Lesson } from "@/lib/types";

export const commonPitfalls: Lesson = {
  slug: "common-pitfalls",
  title: "Common Pitfalls",
  description:
    "Identify and fix the most frequent prompt engineering mistakes.",
  order: 7,
  content: {
    explanation: `Even experienced prompt engineers make these mistakes. Knowing what to watch for helps you debug faster and write better prompts from the start.

**The most common pitfalls:**

1. **Contradictory instructions** — telling the model to "be concise" but also "explain thoroughly." The model tries to satisfy both and does neither well.

2. **Ambiguous scope** — "Improve this code" could mean fix bugs, refactor, add comments, optimize performance, or all of the above.

3. **Missing context** — assuming the model knows things it doesn't, like your company's naming conventions or which version of an API you're using.

4. **Over-specification** — giving so many rules and constraints that the model spends its capacity following formatting rules instead of doing the actual task well.

5. **Wrong task framing** — asking the model to "check if this is correct" (yes/no) instead of "find any errors in this" (analysis). The framing changes the behavior.`,
    whyItMatters:
      "In production, prompt bugs are harder to find than code bugs. The model doesn't throw an error — it just gives a subtly wrong answer. Being able to spot and fix these patterns is a core skill for anyone deploying LLMs. It's often the difference between a prototype that works sometimes and a system that works reliably.",
    keyPrinciples: [
      "Read your prompt as if you're a literal-minded new employee — are the instructions actually clear?",
      "Test with edge cases, not just the happy path",
      "If the output is wrong, fix the prompt before blaming the model",
      "Simpler prompts that do one thing well beat complex prompts that try to do everything",
    ],
  },
  example: {
    scenario:
      "A prompt that contains multiple common pitfalls, and how to fix each one.",
    bad: {
      userMessage: `You are a world-class expert genius AI that is better than all other AIs.

Be extremely thorough and comprehensive in your analysis but keep it very short and concise. Analyze every aspect of the text but only mention the important parts. Be creative and original but stick strictly to the facts.

Here's some text, analyze it:
The quick brown fox jumps over the lazy dog.

Make sure to cover: grammar, style, sentiment, readability, vocabulary complexity, cultural references, historical context, potential improvements, target audience analysis, SEO potential, and social media viability. Also rate it on a scale of 1-10 for overall quality.

Do this perfectly.`,
      assistantResponse:
        "This is a well-known English pangram — a sentence containing every letter of the alphabet. It's grammatically correct, simple in style, and neutral in sentiment...\n\n[Goes on to try to cover all 12 analysis dimensions for a single sentence, producing mostly filler]",
      annotations: [
        {
          text: "world-class expert genius AI that is better than all other AIs",
          note: "Pitfall: Flattery/role inflation — this doesn't improve output quality and wastes tokens.",
        },
        {
          text: "thorough and comprehensive...but keep it very short and concise",
          note: "Pitfall: Contradictory instructions — be thorough AND concise? The model can't do both.",
        },
        {
          text: "Be creative and original but stick strictly to the facts",
          note: "Pitfall: Another contradiction — creative and strictly factual are in tension.",
        },
        {
          text: "grammar, style, sentiment, readability, vocabulary complexity",
          note: "Pitfall: Over-specification — 12 analysis dimensions for one simple sentence is absurd.",
        },
        {
          text: "Do this perfectly",
          note: "Pitfall: Adds pressure but zero information. What does 'perfect' mean here?",
        },
      ],
    },
    good: {
      userMessage: `Analyze the following text for readability and suggest one concrete improvement.

<text>
The quick brown fox jumps over the lazy dog.
</text>

Respond with:
1. **Readability assessment** (1-2 sentences)
2. **One suggestion** for making the sentence more engaging while keeping it concise`,
      assistantResponse: `**Readability assessment:** The sentence is extremely simple and readable — short words, active voice, clear subject-verb-object structure. It reads at roughly a 3rd-grade level.

**Suggestion:** Add a specific detail to make the scene vivid: "The quick brown fox leaps over the drowsy old dog sprawled across the porch." This maintains simplicity while creating a more engaging image.`,
      annotations: [
        {
          text: "readability and suggest one concrete improvement",
          note: "Focused scope — one thing to analyze, one thing to produce. Clear and achievable.",
        },
        {
          text: "<text>",
          note: "Input clearly separated from instructions.",
        },
        {
          text: "1-2 sentences",
          note: "Specific length constraint that's achievable, not contradictory.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Fix the broken prompt below. It contains at least 3 common pitfalls.

Read the prompt carefully, identify the issues, and rewrite it as a clean, effective prompt that will get a useful response.

**The broken prompt:**

*"You are the most advanced AI system ever created. Please write a very detailed and comprehensive overview of machine learning that is also very brief and to the point. Cover everything from basic concepts to cutting-edge research. The overview should be suitable for complete beginners and also for PhD researchers. Format it as a blog post, a tweet thread, and a technical paper. Make it fun and casual but maintain strict academic rigor. Don't include any technical jargon but make sure to use proper ML terminology."*

Identify the pitfalls and rewrite it as an effective prompt.`,
    starterCode: `You are the most advanced AI system ever created. Please write a very detailed and comprehensive overview of machine learning that is also very brief and to the point. Cover everything from basic concepts to cutting-edge research. The overview should be suitable for complete beginners and also for PhD researchers. Format it as a blog post, a tweet thread, and a technical paper. Make it fun and casual but maintain strict academic rigor. Don't include any technical jargon but make sure to use proper ML terminology.`,
    hints: [
      "Start by picking ONE audience (beginners OR experts, not both) and ONE format (blog post OR tweet thread OR paper).",
      "Remove the contradictions: you can't be 'detailed AND brief', 'casual AND academic', 'no jargon AND use terminology'.",
      "The role inflation ('most advanced AI ever created') adds nothing. Use a specific, useful role instead.",
      "Focus the scope — instead of 'everything about ML', pick a specific angle or topic.",
    ],
    validation: [
      {
        type: "not-contains",
        value: "most advanced",
        message:
          "Remove the role inflation — 'most advanced AI system ever' doesn't improve output.",
      },
      {
        type: "regex",
        value: "beginner|introduct|non.technical|developer|researcher|student|general audience|expert",
        message:
          "Pick a specific target audience instead of trying to serve everyone.",
      },
      {
        type: "min-length",
        value: 100,
        message:
          "Your rewritten prompt should be substantial enough to give clear direction.",
      },
      {
        type: "regex",
        value: "blog|tweet|paper|article|overview|guide|post|explainer|summary",
        message:
          "Specify ONE output format, not three competing ones.",
      },
    ],
    sampleSolution: `Write a beginner-friendly blog post introducing the core concepts of machine learning.

Target audience: software developers who have never worked with ML but are comfortable with programming concepts like functions, loops, and data structures.

Cover these 3 concepts:
1. What ML is and how it differs from traditional programming
2. Supervised vs. unsupervised learning (with a simple example of each)
3. How to think about when ML is the right solution to a problem

Guidelines:
- Use plain language but don't shy away from introducing ML terms — just define them when first used
- Include a simple analogy for each concept
- Keep the total length to around 500 words
- Conversational tone, like explaining to a colleague over coffee`,
  },
};
