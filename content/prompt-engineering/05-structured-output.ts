import { Lesson } from "@/lib/types";

export const structuredOutput: Lesson = {
  slug: "structured-output",
  title: "Structured Output",
  description:
    "Use XML tags and format specifications to get organized, parseable responses.",
  order: 5,
  content: {
    explanation: `Structured output techniques give you control over **how** the model organizes its response. This is critical for:

- **Programmatic parsing** — when your application needs to extract specific fields from the response
- **Consistency** — ensuring every response follows the same format
- **Clarity** — making complex responses easy to read and navigate

The most effective techniques for Claude:

**XML tags** — Claude is trained to work well with XML tags for organizing both inputs and outputs. Use them to:
- Separate sections of your prompt (instructions vs. data vs. context)
- Request structured output sections
- Create parseable response formats

**Explicit format instructions** — Describe the exact format you want: JSON, markdown tables, bullet lists, etc.

**Response prefilling** — In the API, you can start the assistant's response to lock in a format (e.g., start with \`{\` to enforce JSON).`,
    whyItMatters:
      "Production LLM applications almost always need structured output. Whether you're building a classification pipeline, an extraction system, or a user-facing assistant, you need to reliably parse the model's response. XML tags and format specifications are the simplest, most reliable way to achieve this.",
    keyPrinciples: [
      "Use XML tags to separate input sections: <context>, <instructions>, <examples>",
      "Use XML tags in the requested output format: <answer>, <reasoning>, <sources>",
      "For JSON output, specify the exact schema you expect",
      "Be explicit about what each section should contain",
    ],
  },
  example: {
    scenario:
      "You need to extract structured information from a job posting to populate a database.",
    bad: {
      userMessage: `Extract the key information from this job posting:

"Senior Frontend Engineer at TechCo. Remote-friendly, based in NYC.
5+ years React experience required. $150k-$180k. Must know TypeScript
and have experience with design systems. Reports to VP of Engineering."`,
      assistantResponse: `Here's the key information from the job posting:

The position is for a Senior Frontend Engineer at TechCo. The role is remote-friendly but based in New York City. They're looking for someone with at least 5 years of React experience who also knows TypeScript and has worked with design systems. The salary range is $150,000 to $180,000, and the role reports to the VP of Engineering.`,
      annotations: [
        {
          text: "Here's the key information",
          note: "Just a paragraph restatement — not structured, not parseable, not useful for a database.",
        },
      ],
    },
    good: {
      userMessage: `Extract structured information from the following job posting. Return your response using exactly these XML tags:

<job_info>
  <title>job title</title>
  <company>company name</company>
  <location>location with remote policy</location>
  <salary_min>number only</salary_min>
  <salary_max>number only</salary_max>
  <experience_years>minimum years required</experience_years>
  <required_skills>comma-separated list</required_skills>
  <reports_to>manager title</reports_to>
</job_info>

<posting>
Senior Frontend Engineer at TechCo. Remote-friendly, based in NYC.
5+ years React experience required. $150k-$180k. Must know TypeScript
and have experience with design systems. Reports to VP of Engineering.
</posting>`,
      assistantResponse: `<job_info>
  <title>Senior Frontend Engineer</title>
  <company>TechCo</company>
  <location>NYC (remote-friendly)</location>
  <salary_min>150000</salary_min>
  <salary_max>180000</salary_max>
  <experience_years>5</experience_years>
  <required_skills>React, TypeScript, design systems</required_skills>
  <reports_to>VP of Engineering</reports_to>
</job_info>`,
      annotations: [
        {
          text: "<job_info>",
          note: "XML structure makes it trivial to parse programmatically.",
        },
        {
          text: "<salary_min>number only</salary_min>",
          note: "Specifying 'number only' ensures clean data — no dollar signs or 'k' abbreviations.",
        },
        {
          text: "<posting>",
          note: "Input data is clearly separated from instructions using XML tags.",
        },
        {
          text: "150000",
          note: "Clean, parseable number — exactly what a database needs.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Restructure the flat prompt below using XML tags.

The prompt asks the model to analyze a product review. Your restructured version should:
- Separate the instructions from the input data using XML tags
- Define a structured output format with XML tags
- Include at least 3 output fields

Original flat prompt: *"Look at this review and tell me the sentiment, what product features are mentioned, and whether the reviewer would recommend the product: 'Great battery life and the camera is decent, but it's way too expensive for what you get. I'd probably look at cheaper alternatives.'"*`,
    starterCode: `Look at this review and tell me the sentiment, what product features are mentioned, and whether the reviewer would recommend the product: "Great battery life and the camera is decent, but it's way too expensive for what you get. I'd probably look at cheaper alternatives."`,
    hints: [
      "Wrap the review text in a tag like <review> to separate it from instructions.",
      "Define your expected output format with XML tags like <analysis>, <sentiment>, <features>, <recommendation>.",
      "Specify what each output field should contain — e.g., <sentiment>positive, negative, or mixed</sentiment>.",
      "Put the instructions at the top, input data in the middle, and output format specification at the end.",
    ],
    validation: [
      {
        type: "has-section",
        value: "<review>",
        message:
          "Wrap the input review text in an XML tag like <review>.",
      },
      {
        type: "regex",
        value: "<sentiment|<features|<recommend|<analysis|<rating|<summary",
        message:
          "Define at least one output field using XML tags (e.g., <sentiment>, <features>).",
      },
      {
        type: "regex",
        value: "battery|camera|expensive|cheaper",
        message: "Include the original review text in your prompt.",
      },
      {
        type: "min-length",
        value: 200,
        message:
          "Your restructured prompt should be more detailed than the original.",
      },
    ],
    sampleSolution: `Analyze the following product review and return structured results.

<review>
Great battery life and the camera is decent, but it's way too expensive for what you get. I'd probably look at cheaper alternatives.
</review>

<instructions>
Analyze the review above and return your response in the following XML format. Be concise — each field should be a short phrase or single word, not a paragraph.
</instructions>

Return your analysis using exactly this structure:

<analysis>
  <sentiment>positive, negative, or mixed</sentiment>
  <features_mentioned>comma-separated list of product features discussed</features_mentioned>
  <pros>brief list of positives mentioned</pros>
  <cons>brief list of negatives mentioned</cons>
  <would_recommend>yes, no, or unlikely — based on the reviewer's tone</would_recommend>
</analysis>`,
  },
};
