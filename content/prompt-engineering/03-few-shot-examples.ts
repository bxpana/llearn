import { Lesson } from "@/lib/types";

export const fewShotExamples: Lesson = {
  slug: "few-shot-examples",
  title: "Few-Shot Examples",
  description:
    "Teach the model the pattern you want by showing input-output pairs.",
  order: 3,
  content: {
    explanation: `Few-shot prompting is one of the most reliable techniques for getting consistent, correctly-formatted outputs. Instead of describing what you want, you **show** the model examples of correct input-output pairs.

The model learns the pattern from your examples and applies it to new inputs. This works because:

- **Format consistency** — the model mirrors the structure of your examples
- **Implicit rules** — patterns you'd struggle to describe in words become obvious from examples
- **Edge case handling** — examples can demonstrate how to handle tricky cases

The sweet spot is usually 2-4 examples. One example might not establish a clear pattern. More than 5 rarely adds value and wastes tokens.`,
    whyItMatters:
      "Few-shot examples are essential for production classification, extraction, and formatting tasks. They're more reliable than long natural language descriptions and give you fine-grained control over output format. When you need 99% format consistency, few-shot is your go-to technique.",
    keyPrinciples: [
      "Use 2-4 examples to establish a clear pattern",
      "Include diverse examples — cover different categories or edge cases",
      "Keep formatting identical across all examples — the model copies your structure exactly",
      "Put examples before the actual input so the model has the pattern fresh in context",
    ],
  },
  example: {
    scenario:
      "You're building a system to classify customer feedback into categories.",
    bad: {
      userMessage: `Classify this customer feedback into a category (positive, negative, or neutral) and extract the main topic:

"The new dashboard is confusing and I can't find my reports anymore."`,
      assistantResponse: `Category: Negative
Main Topic: The customer is expressing frustration with the new dashboard redesign, specifically about the difficulty in locating reports. This suggests a UX/navigation issue that may be affecting user workflow and productivity. The feedback indicates that the previous dashboard layout was more intuitive for report access.`,
      annotations: [
        {
          text: "Category: Negative",
          note: "Right answer, but the format is inconsistent — sometimes it might output differently.",
        },
        {
          text: "The customer is expressing frustration",
          note: "Way too verbose for a classification task. We wanted a short topic, not an analysis essay.",
        },
      ],
    },
    good: {
      userMessage: `Classify customer feedback into a category and extract the main topic. Use exactly this format:

Feedback: "I love how fast the new search feature is!"
Category: positive
Topic: search performance

Feedback: "The app crashes every time I try to upload a file larger than 10MB."
Category: negative
Topic: file upload bug

Feedback: "I noticed you added dark mode. It's fine, I guess."
Category: neutral
Topic: dark mode

Feedback: "The new dashboard is confusing and I can't find my reports anymore."`,
      assistantResponse: `Category: negative
Topic: dashboard navigation`,
      annotations: [
        {
          text: 'Feedback: "I love how fast',
          note: "First example: positive category — establishes the format and shows a positive case.",
        },
        {
          text: 'Feedback: "The app crashes',
          note: "Second example: negative with a specific topic — shows how to extract concise topics.",
        },
        {
          text: '"I noticed you added dark mode. It\'s fine, I guess."',
          note: "Third example: the tricky neutral case — teaches the model where the boundary is.",
        },
        {
          text: "Topic: dashboard navigation",
          note: "Output follows the exact format from examples — concise, no extra commentary.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Create a few-shot prompt for sentiment analysis of product reviews.

Write a prompt that classifies product reviews as "positive", "negative", or "mixed" and extracts a one-line summary.

Your prompt should include:
- At least 2 example input-output pairs
- A consistent format across all examples
- The actual review to classify at the end

The review to classify: *"Battery life is amazing but the screen quality is disappointing for the price."*`,
    starterCode: `Classify this product review:

"Battery life is amazing but the screen quality is disappointing for the price."`,
    hints: [
      "Start with a brief instruction line, then show examples in a consistent format.",
      "Include at least one 'mixed' example since the test review has both positive and negative aspects.",
      "Use a clear delimiter between examples — blank lines or '---' work well.",
      "Make sure your example topics/summaries are short — one line max — to set the right expectation.",
    ],
    validation: [
      {
        type: "min-length",
        value: 150,
        message:
          "Your prompt needs more content — include at least 2 example input-output pairs.",
      },
      {
        type: "regex",
        value: "positive",
        message:
          "Include at least one example classified as 'positive' to show the pattern.",
      },
      {
        type: "regex",
        value: "negative",
        message:
          "Include at least one example classified as 'negative' to show the pattern.",
      },
      {
        type: "regex",
        value: "battery|screen|disappointing|amazing",
        message:
          "Include the actual review to classify at the end of your prompt.",
      },
      {
        type: "regex",
        value: "(Review|Input|Feedback|Text).*\\n.*(Sentiment|Category|Classification|Rating)",
        message:
          "Use a consistent format pattern across your examples (e.g., 'Review:' followed by 'Sentiment:').",
      },
    ],
    sampleSolution: `Classify product reviews by sentiment and provide a one-line summary.

Review: "This laptop is incredibly fast and the keyboard feels great. Best purchase I've made this year."
Sentiment: positive
Summary: Fast performance and great keyboard quality.

Review: "Terrible customer service. The product arrived damaged and nobody responded to my emails for two weeks."
Sentiment: negative
Summary: Damaged product with unresponsive customer service.

Review: "The camera takes stunning photos in daylight but struggles badly in low light conditions."
Sentiment: mixed
Summary: Excellent daylight photos but poor low-light performance.

Review: "Battery life is amazing but the screen quality is disappointing for the price."
Sentiment:`,
  },
};
