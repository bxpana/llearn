import { Lesson } from "@/lib/types";

export const clearInstructions: Lesson = {
  slug: "clear-instructions",
  title: "Clear Instructions",
  description: "Write unambiguous prompts that get consistent, useful results.",
  order: 1,
  content: {
    explanation: `The single most impactful thing you can do to improve LLM outputs is to write clear, specific instructions. Vague prompts produce vague results.

A good prompt specifies:
- **What** you want the model to do (the task)
- **Who** the output is for (the audience)
- **How** the output should be formatted (structure, length)
- **What constraints** to follow (what to include or avoid)

Think of it like giving instructions to a new team member on their first day — the more context and specificity you provide, the better the result.`,
    whyItMatters:
      "In production systems, unclear prompts lead to inconsistent outputs, requiring retries and manual corrections. Clear instructions reduce latency, improve reliability, and make outputs predictable enough to build on.",
    keyPrinciples: [
      "Be specific about the task — don't say 'summarize', say 'write a 2-sentence summary for a technical audience'",
      "State the output format explicitly — bullet points, JSON, paragraph, table",
      "Include constraints — word count, tone, what to include/exclude",
      "Provide context about who will read the output",
    ],
  },
  example: {
    scenario:
      "You need to summarize a meeting transcript for stakeholders who weren't present.",
    bad: {
      userMessage: "Summarize this meeting transcript.",
      assistantResponse:
        "The meeting covered several topics including project timelines, budget concerns, and team assignments. Key decisions were made about the Q3 roadmap and resource allocation. The team discussed potential risks and mitigation strategies. Action items were assigned to various team members with deadlines set for the following week.",
      annotations: [
        {
          text: "several topics",
          note: "Vague — which topics? The reader needs specifics.",
        },
        {
          text: "Key decisions were made",
          note: "What decisions? This is too generic to be useful.",
        },
        {
          text: "various team members",
          note: "Who? Without names, this summary isn't actionable.",
        },
      ],
    },
    good: {
      userMessage: `Summarize the following meeting transcript for executive stakeholders who were not present.

Format your response as:
1. **Key Decisions** (bullet points, max 5)
2. **Action Items** (who, what, by when — in a table)
3. **Open Questions** (anything unresolved)

Keep the summary under 200 words. Use a professional tone. Focus on decisions and outcomes, not discussion details.

<transcript>
[Meeting transcript would go here]
</transcript>`,
      assistantResponse: `**Key Decisions**
- Approved Q3 roadmap focusing on API v2 launch and mobile app redesign
- Budget increased by 15% for contractor support through September
- Moved deployment deadline from Aug 15 to Aug 30 to accommodate testing

**Action Items**

| Who | What | By When |
|-----|------|---------|
| Sarah Chen | Finalize API v2 spec document | March 15 |
| Dev Team | Complete load testing on staging | March 22 |
| Marcus | Send revised budget to Finance | March 10 |

**Open Questions**
- Whether to hire a dedicated QA engineer or continue using contractors
- Timeline for deprecating API v1 (needs customer impact analysis)`,
      annotations: [
        {
          text: "executive stakeholders who were not present",
          note: "Specifies the audience and their context — the model adjusts detail level accordingly.",
        },
        {
          text: "Format your response as:",
          note: "Explicit structure makes the output predictable and parseable.",
        },
        {
          text: "Keep the summary under 200 words",
          note: "Concrete constraint prevents rambling.",
        },
        {
          text: "<transcript>",
          note: "XML tags clearly delineate input data from instructions.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Rewrite the vague prompt below into a clear, specific prompt.

The original prompt is: *"Tell me about our product's features."*

You're writing this prompt for a scenario where you need marketing copy for a landing page. Rewrite it so the output will be useful without any follow-up.

Your rewritten prompt should include:
- A specific task description
- The target audience
- An output format specification
- At least one constraint (length, tone, etc.)`,
    starterCode: `Tell me about our product's features.`,
    hints: [
      "Start by specifying what kind of content you want — e.g., 'Write marketing copy for...'",
      "Define who will read this — developers? executives? end users?",
      "Specify the format — bullet points, paragraphs, a comparison table?",
      "Add a constraint like word count, tone (professional, casual, exciting), or what to emphasize.",
    ],
    validation: [
      {
        type: "min-length",
        value: 100,
        message:
          "Your prompt should be more detailed — aim for at least a few sentences of instruction.",
      },
      {
        type: "regex",
        value:
          "audience|reader|user|developer|customer|visitor|stakeholder|executive|team",
        message:
          "Specify who the output is for — mention the target audience.",
      },
      {
        type: "regex",
        value:
          "bullet|list|paragraph|table|section|format|heading|structure|point",
        message:
          "Include a format specification — how should the output be structured?",
      },
      {
        type: "regex",
        value: "\\b\\d+\\b|tone|professional|concise|brief|short|avoid|must|should|don't|do not|focus on|limit",
        message:
          "Add at least one concrete constraint — word count, tone, or what to include/exclude.",
      },
    ],
    sampleSolution: `Write marketing copy describing our project management tool's key features for a landing page targeting engineering team leads.

Format the output as:
- A one-line tagline (under 10 words)
- 4 feature highlights, each with a bold title and a 1-2 sentence description
- A closing call-to-action sentence

Tone: Professional but approachable. Emphasize how each feature saves time or reduces complexity. Avoid generic phrases like "best-in-class" or "cutting-edge." Focus on concrete benefits rather than technical specs.`,
  },
};
