import { Lesson } from "@/lib/types";

export const toolUse: Lesson = {
  slug: "tool-use",
  title: "Tool Use / Function Calling",
  description:
    "Learn how tool use works with LLMs, how to define effective tool schemas, and patterns for reliable function calling.",
  order: 2,
  content: {
    explanation: `Tool use (also called function calling) is the pattern where an LLM generates structured calls to external functions, your application executes those functions, and the results are fed back to the model for further reasoning. This turns an LLM from a text generator into an agent that can take actions in the real world.

**How Tool Use Works**

The flow has three steps that often repeat in a loop:

1. **Model receives tools** — you send the model a list of available tools with their schemas alongside the user message
2. **Model generates a tool call** — instead of (or in addition to) text, the model outputs a structured function call with specific arguments
3. **Application executes and returns** — your code validates the arguments, calls the actual function, and sends the result back to the model as a new message

The model then either generates another tool call, produces a final text response, or both. This loop continues until the model decides it has enough information to answer.

**Defining Effective Tool Schemas**

The quality of your tool definitions directly determines how reliably the model uses them. Each tool definition should include:

- **A clear, specific name** — \`search_knowledge_base\` is better than \`search\`. The name helps the model select the right tool.
- **A detailed description** — explain what the tool does, when to use it, and any constraints. This is the model's primary guide.
- **Typed parameters with constraints** — specify types (string, number, enum), required vs. optional fields, valid ranges, and format expectations (e.g., ISO 8601 dates).
- **Examples in the description** — showing example inputs helps the model understand the expected format.

**Parallel vs. Sequential Tool Calls**

Some APIs support parallel tool calling, where the model requests multiple tools in a single turn. This is powerful for independent lookups (e.g., fetching weather AND calendar events simultaneously). However, sequential calls are necessary when one tool's output feeds into another's input (e.g., search for a user, then fetch their order history). Design your tool set with these dependencies in mind.

**Validating Tool Arguments**

Never trust tool call arguments blindly. The model can hallucinate parameter values, use wrong types, or pass values outside valid ranges. Always:

- Validate argument types and required fields before execution
- Sanitize string inputs (especially if they touch databases or APIs)
- Return clear error messages when validation fails so the model can self-correct
- Set reasonable defaults for optional parameters

**Error Handling in Tool Loops**

When a tool execution fails, return the error as a tool result rather than crashing. Models are generally good at recovering from tool errors — they'll retry with corrected arguments or try an alternative approach. Limit the maximum number of tool-call rounds (typically 5-10) to prevent infinite loops, and implement a total timeout for the entire tool-use conversation.`,
    whyItMatters:
      "Tool use transforms LLMs from conversational interfaces into systems that can query databases, call APIs, execute code, and take real-world actions. Nearly every production LLM application uses tools in some form — from simple search to complex multi-step workflows. Getting tool schemas right is the difference between a reliable integration and one that hallucinates function calls.",
    keyPrinciples: [
      "Write tool descriptions as if explaining to a new team member — include what the tool does, when to use it, and example inputs",
      "Always validate and sanitize tool call arguments before executing any function, since models can hallucinate values",
      "Return tool execution errors as results rather than throwing exceptions, so the model can self-correct",
      "Set a maximum tool-call loop depth (5-10 rounds) with a total timeout to prevent runaway conversations",
    ],
  },
  example: {
    scenario:
      "A team is defining tools for a travel booking assistant that helps users search for flights and book them.",
    bad: {
      systemPrompt:
        "You are a travel assistant. Use the available tools to help users.",
      userMessage: `Find me a flight from NYC to London next Friday.`,
      assistantResponse: `I'll search for flights.

[Tool call]
function: search
args: { "query": "NYC to London next Friday" }

[Tool result]
{ "error": "Invalid parameters: missing origin, destination, date fields" }

[Tool call]
function: search
args: { "query": "flights", "from": "NYC", "to": "London", "when": "next Friday" }

[Tool result]
{ "error": "Unknown parameter 'when'. Expected 'date' in ISO 8601 format." }`,
      annotations: [
        {
          text: 'function: search',
          note: "A generic tool name like 'search' gives the model no guidance about what kind of search or what parameters to use. Use specific names like 'search_flights'.",
        },
        {
          text: '{ "query": "NYC to London next Friday" }',
          note: "The model passed a freeform string because the schema didn't define structured parameters. This forces the backend to parse natural language — defeating the purpose of structured tool use.",
        },
        {
          text: '"when": "next Friday"',
          note: "Even after an error, the model guesses at parameter names and formats. Without typed schema definitions, the model has to trial-and-error its way to correct calls.",
        },
      ],
    },
    good: {
      systemPrompt:
        "You are a travel booking assistant. Use the provided tools to search for flights and make reservations. Always confirm details with the user before booking.",
      userMessage: `Find me a flight from NYC to London next Friday.`,
      assistantResponse: `I'll search for available flights from New York to London for next Friday.

[Tool call]
function: search_flights
args: {
  "origin": "JFK",
  "destination": "LHR",
  "departure_date": "2026-03-20",
  "cabin_class": "economy",
  "max_results": 5
}

[Tool result]
{
  "flights": [
    { "airline": "British Airways", "flight": "BA178", "departs": "19:00", "arrives": "07:15+1", "price": 485, "currency": "USD" },
    { "airline": "Delta", "flight": "DL1", "departs": "21:30", "arrives": "09:45+1", "price": 512, "currency": "USD" }
  ]
}

I found 2 flights for Friday, March 20th from JFK to London Heathrow:

1. **British Airways BA178** — Departs 7:00 PM, arrives 7:15 AM (+1 day) — $485
2. **Delta DL1** — Departs 9:30 PM, arrives 9:45 AM (+1 day) — $512

Would you like to book one of these, or should I search different dates or airports?`,
      annotations: [
        {
          text: "search_flights",
          note: "A specific, descriptive tool name tells the model exactly what this tool does. It won't confuse it with hotel or car rental search.",
        },
        {
          text: '"origin": "JFK"',
          note: "The schema specifies airport codes (IATA format) with typed string parameters. The model correctly converts 'NYC' to 'JFK' because the tool description specified the expected format.",
        },
        {
          text: '"departure_date": "2026-03-20"',
          note: "The date parameter is typed as ISO 8601 in the schema. The model converts 'next Friday' to the correct concrete date with no ambiguity.",
        },
        {
          text: "Would you like to book one of these",
          note: "After receiving tool results, the model presents them clearly and asks for confirmation before proceeding — following the system prompt instruction to confirm before booking.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Define 3 tool schemas for a travel booking assistant.

The assistant helps users search for flights, book flights, and check booking status. For each tool, provide:

- **Tool name** — descriptive and specific
- **Description** — what the tool does, when to use it, and any constraints
- **Parameters** — each parameter with its type, whether it's required, constraints, and description
- **Example call** — a sample invocation with realistic arguments

Make your schemas precise enough that an LLM can use them correctly on the first attempt, without guessing at parameter names or formats.`,
    starterCode: `## Tool Schemas: Travel Booking Assistant

### Tool 1: [name]
**Description:** [what this tool does]

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ... | ... | ... | ... |

**Example call:**
\`\`\`json
{ "function": "[name]", "args": { } }
\`\`\`

### Tool 2: [name]
**Description:** [what this tool does]

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ... | ... | ... | ... |

**Example call:**
\`\`\`json
{ "function": "[name]", "args": { } }
\`\`\`

### Tool 3: [name]
**Description:** [what this tool does]

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| ... | ... | ... | ... |

**Example call:**
\`\`\`json
{ "function": "[name]", "args": { } }
\`\`\``,
    hints: [
      "Use specific tool names like 'search_flights' rather than generic names like 'search'.",
      "Specify date formats (ISO 8601), code formats (IATA airport codes), and valid enum values.",
      "Mark parameters as required or optional — think about what the minimum viable call looks like.",
      "Include constraints like max_results limits, valid cabin classes, or booking ID formats in your descriptions.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your schemas need more detail — include complete parameter definitions and example calls for all 3 tools.",
      },
      {
        type: "regex",
        value: "[Tt]ool 1|[Tt]ool 2|[Tt]ool 3|###",
        message: "Define all 3 tool schemas with clear headings for each.",
      },
      {
        type: "regex",
        value: "[Rr]equired|[Oo]ptional",
        message:
          "Specify which parameters are required vs. optional for each tool.",
      },
      {
        type: "regex",
        value: "[Ss]tring|[Nn]umber|[Ii]nteger|[Bb]oolean|[Ee]num|[Aa]rray",
        message:
          "Include type definitions for each parameter (string, number, enum, etc.).",
      },
      {
        type: "regex",
        value: "[Ee]xample|[Ss]ample|```",
        message:
          "Include example calls showing realistic arguments for each tool.",
      },
    ],
    sampleSolution: `## Tool Schemas: Travel Booking Assistant

### Tool 1: search_flights
**Description:** Search for available flights between two airports on a specific date. Use this when the user wants to find flights. Returns up to max_results flights sorted by price. Only searches one-way; for round trips, call twice with swapped origin/destination.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| origin | string | Yes | Departure airport IATA code (e.g., "JFK", "LAX") |
| destination | string | Yes | Arrival airport IATA code (e.g., "LHR", "NRT") |
| departure_date | string | Yes | Departure date in ISO 8601 format (YYYY-MM-DD) |
| cabin_class | enum | No | One of: "economy", "premium_economy", "business", "first". Defaults to "economy" |
| max_results | integer | No | Maximum number of results to return (1-20). Defaults to 5 |
| max_price | number | No | Maximum price in USD. Omit to show all price ranges |

**Example call:**
\`\`\`json
{ "function": "search_flights", "args": { "origin": "JFK", "destination": "LHR", "departure_date": "2026-03-20", "cabin_class": "economy", "max_results": 5 } }
\`\`\`

### Tool 2: book_flight
**Description:** Book a specific flight for the user. Use this after the user has selected a flight from search results and confirmed they want to proceed. Requires a valid flight_id from a previous search_flights result. Returns a booking confirmation with a booking reference number.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| flight_id | string | Yes | The unique flight identifier returned from search_flights (e.g., "BA178-2026-03-20") |
| passenger_name | string | Yes | Full name of the passenger as it appears on their travel document |
| passenger_email | string | Yes | Email address for booking confirmation and updates |
| cabin_class | enum | Yes | One of: "economy", "premium_economy", "business", "first" |
| seat_preference | enum | No | One of: "window", "middle", "aisle". Defaults to no preference |
| special_requests | string | No | Any special requirements (e.g., wheelchair assistance, dietary needs) |

**Example call:**
\`\`\`json
{ "function": "book_flight", "args": { "flight_id": "BA178-2026-03-20", "passenger_name": "Jane Smith", "passenger_email": "jane@example.com", "cabin_class": "economy", "seat_preference": "window" } }
\`\`\`

### Tool 3: get_booking_status
**Description:** Check the current status of an existing booking. Use this when the user wants to know their booking details, flight status, or check-in availability. Requires a valid booking reference number in the format "BK" followed by 6 alphanumeric characters.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| booking_reference | string | Yes | The booking reference number (format: "BK" + 6 alphanumeric chars, e.g., "BK4F8A2D") |
| include_details | boolean | No | If true, returns full flight details including terminal, gate, and baggage info. Defaults to false |

**Example call:**
\`\`\`json
{ "function": "get_booking_status", "args": { "booking_reference": "BK4F8A2D", "include_details": true } }
\`\`\``,
  },
};
