import { Lesson } from "@/lib/types";

export const evalStrategy: Lesson = {
  slug: "eval-strategy",
  title: "Eval Strategy for Organizations",
  description:
    "Design phased eval adoption plans with stakeholder roles, timelines, and business-aligned quality targets.",
  order: 6,
  content: {
    explanation: `Building evals is a technical skill. Getting an organization to adopt evals is a strategic one. Most organizations don't fail at evals because they can't write test cases — they fail because they don't know where to start, who should be involved, or how to justify the investment.

A successful eval adoption plan has three elements:

**1. Phased rollout** — don't try to eval everything at once. Start with one high-impact use case, prove value, then expand.
- Phase 1: Pick one use case, build a basic eval (5-10 test cases), run it manually
- Phase 2: Expand test coverage, add categories, automate runs
- Phase 3: Integrate into CI/CD, set up monitoring, expand to more use cases

**2. Stakeholder roles** — evals require cross-functional collaboration:
- **Domain experts** (clinicians, lawyers, support leads) define what "good" looks like. They write scoring criteria and label ground truth.
- **Engineers** build the eval infrastructure, automate runs, and integrate into deployment pipelines.
- **Leadership** sets quality thresholds based on business requirements and approves the investment.

**3. Business framing** — translate eval metrics into business language:
- "Accuracy improved from 72% to 94%" → "We reduced manual review from 100% of outputs to 6%"
- "Safety eval passes at 100%" → "Zero policy violations in the last 10,000 outputs"
- "Eval suite runs in CI/CD" → "Every prompt change is validated before it reaches customers"

The most common failure mode: engineering builds evals in isolation without domain expert input. The evals measure the wrong things, nobody trusts the results, and the effort is wasted.`,
    whyItMatters:
      "As an SA, you'll often be the person advising organizations on how to adopt evals. Most customers don't need help writing regex validators — they need help structuring the human and process side. A phased plan with clear stakeholder roles and business framing is often the most valuable artifact you can deliver.",
    keyPrinciples: [
      "Start with one high-impact use case, not a company-wide eval initiative",
      "Domain experts define quality — engineers build the measurement system",
      "Frame eval results in business terms: cost saved, risk reduced, time reclaimed",
      "Phase the rollout: manual first, then automated, then integrated into CI/CD",
    ],
  },
  example: {
    scenario:
      "A nonprofit wants to use LLMs to draft donor outreach emails. You need to advise them on eval adoption.",
    bad: {
      userMessage:
        "You should definitely use evals for your donor emails. Set up a test suite with at least 50 test cases covering different donor segments, tone variations, and personalization levels. Use LLM-as-judge for scoring and integrate it into your deployment pipeline.",
      assistantResponse:
        "That sounds comprehensive! We'll get started on building all of that.",
      annotations: [
        {
          text: "at least 50 test cases",
          note: "Overwhelming for a team that's never written an eval. They'll stall before starting.",
        },
        {
          text: "LLM-as-judge",
          note: "Jumping to advanced techniques before the basics are in place. Start simple.",
        },
        {
          text: "integrate it into your deployment pipeline",
          note: "They may not have a deployment pipeline. The advice assumes an engineering maturity that may not exist.",
        },
      ],
    },
    good: {
      userMessage: `## Eval Adoption Plan: Donor Outreach Emails

### Phase 1: Foundation (Weeks 1-2)
**Goal:** Prove that evals add value with minimal effort.

**Use case:** Monthly donor renewal emails

**Stakeholders:**
- **Development Director (domain expert):** Defines what a "good" donor email looks like. Reviews and labels 5 test cases.
- **Communications Associate (operator):** Runs the eval manually. Tests prompt changes before sending.
- **Executive Director (leadership):** Sets the quality bar: "emails must be indistinguishable from human-written ones."

**Eval setup:**
- 5 test cases: 2 typical donors, 1 lapsed donor, 1 major donor, 1 first-time donor
- Scoring rubric: Tone (1-5), Personalization (1-5), Call-to-action clarity (1-5)
- Passing threshold: Average ≥4.0, no dimension below 3
- Run manually: Development Director scores outputs before each monthly send

**Success metric:** Time saved on email drafting without quality regression.

### Phase 2: Expansion (Weeks 3-6)
**Goal:** Broader coverage and consistency.

- Expand to 15 test cases covering all donor segments
- Add safety tests: no incorrect donation amounts, no wrong donor names
- Train Communications Associate to run evals independently
- Start tracking scores over time in a spreadsheet

**Success metric:** Development Director spends <30 min reviewing instead of writing emails.

### Phase 3: Maturity (Months 2-3)
**Goal:** Sustainable, repeatable process.

- Automate eval runs (simple script or platform integration)
- Add regression tests when issues are found
- Expand to other use cases: grant application summaries, volunteer communications
- Present ROI to board: hours saved, consistency improvement, donor response rates

**Success metric:** Eval process runs without SA involvement. Organization can independently add test cases and iterate.`,
      assistantResponse: `This plan works because it:

1. **Starts small** — 5 test cases, one use case, manual process. The team can start this week.
2. **Assigns specific roles** — the Development Director defines quality, the Communications Associate operates, leadership sets the bar.
3. **Phases investment** — each phase delivers value before committing to the next.
4. **Speaks their language** — "time saved" and "hours reduced" rather than "F1 score improved."
5. **Has an exit criteria** — Phase 3 success means the org runs evals independently.`,
      annotations: [
        {
          text: "Phase 1: Foundation (Weeks 1-2)",
          note: "Concrete timeline with a small, achievable scope. The team sees value in 2 weeks, not 2 months.",
        },
        {
          text: "Development Director (domain expert):",
          note: "The person who knows what 'good' looks like drives quality definition. Engineering doesn't guess.",
        },
        {
          text: "Run manually",
          note: "No infrastructure needed in Phase 1. Remove every barrier to getting started.",
        },
        {
          text: "Present ROI to board",
          note: "Business framing: translate eval metrics into language leadership cares about — time, money, risk.",
        },
      ],
    },
  },
  exercise: {
    instructions: `**Your task:** Write an eval adoption plan for a healthcare organization.

The system: An LLM that summarizes patient intake forms for clinical staff. The summaries help nurses quickly understand a patient's chief complaint, relevant history, and allergies before the appointment.

Your plan must include:
- At least 2 phases with timelines
- Stakeholder roles (clinical staff must be involved in defining quality)
- Safety considerations (this is healthcare — errors can harm patients)
- Business framing (how you communicate value to hospital leadership)
- A path to independence (the organization can run evals without you)

Write it as an adoption plan document.`,
    starterCode: `## Eval Adoption Plan: Patient Intake Summarizer

### Phase 1: [Name] ([Timeline])
**Goal:** [what this phase achieves]

**Stakeholders:**
- [role]: [responsibility]

**Eval setup:**
- [test cases]
- [scoring criteria]
- [safety considerations]

### Phase 2: [Name] ([Timeline])
**Goal:** [what this phase achieves]

### Business Case
[how to communicate value to leadership]

### Path to Independence
[how the org sustains this without external help]`,
    hints: [
      "Phase 1 should be small enough to complete in 1-2 weeks. Don't try to cover every medical specialty on day one.",
      "Clinical staff (nurses, doctors) must define what a 'good' intake summary looks like — engineers alone can't judge medical accuracy.",
      "Safety is critical: missed allergies or incorrect medication history could cause patient harm. Consider making safety tests non-negotiable (100% pass rate).",
      "Hospital leadership cares about: patient safety, nurse efficiency, compliance, and liability. Frame your metrics accordingly.",
    ],
    validation: [
      {
        type: "min-length",
        value: 500,
        message:
          "Your adoption plan needs more detail — include phases, stakeholders, safety considerations, and business framing.",
      },
      {
        type: "regex",
        value: "[Pp]hase [12]|[Pp]hase (one|two|1|2)",
        message: "Include at least 2 phases with distinct goals and timelines.",
      },
      {
        type: "regex",
        value:
          "[Cc]linic|[Nn]urse|[Dd]octor|[Pp]hysician|[Cc]linician|[Mm]edical staff",
        message:
          "Clinical staff must be involved — they define what a quality intake summary looks like.",
      },
      {
        type: "regex",
        value:
          "[Ss]afety|[Aa]llerg|[Mm]edicat|[Hh]arm|[Rr]isk|[Pp]atient safety",
        message:
          "Address safety explicitly — this is healthcare where errors have serious consequences.",
      },
      {
        type: "regex",
        value:
          "[Bb]usiness|[Ll]eadership|[Rr]OI|[Cc]ost|[Ee]fficiency|[Tt]ime saved|[Vv]alue",
        message:
          "Include business framing — translate eval metrics into language hospital leadership understands.",
      },
      {
        type: "regex",
        value:
          "[Ii]ndependen|[Ss]ustain|[Ss]elf.?suf|[Ww]ithout (you|SA|external)|[Oo]wn(ership)?|[Hh]andoff",
        message:
          "Include a path to independence — how will the org run evals on their own?",
      },
    ],
    sampleSolution: `## Eval Adoption Plan: Patient Intake Summarizer

### Phase 1: Safety Validation (Weeks 1-3)
**Goal:** Establish that the summarizer is safe for clinical use by validating it catches critical patient information.

**Stakeholders:**
- **Lead Nurse (domain expert):** Defines what a complete, accurate intake summary looks like. Labels 8 test cases with expected summaries. Scores outputs on clinical accuracy.
- **Health IT Engineer (builder):** Sets up the eval, runs test cases, documents results. Manages prompt iterations.
- **Chief Nursing Officer (leadership):** Sets the quality bar: "No missed allergies, no incorrect medications, no fabricated medical history. Ever."
- **Compliance Officer (safety):** Reviews the eval rubric to ensure it aligns with regulatory requirements (HIPAA, documentation standards).

**Eval setup:**
- 8 test cases covering: routine visit (2), multiple chronic conditions (2), drug allergies (2), pediatric patient (1), non-English speaker intake form (1)
- Scoring rubric:
  - Allergy accuracy: binary pass/fail (all allergies listed or not) — **100% required**
  - Medication accuracy: binary pass/fail (all current meds listed) — **100% required**
  - Chief complaint capture: 1-5 scale (must score ≥4)
  - Relevant history completeness: 1-5 scale (must score ≥3)
- Safety tests (non-negotiable, 100% pass):
  - Must never omit a documented allergy
  - Must never fabricate a diagnosis or medication not in the intake form
  - Must never include another patient's information
- Run manually: Lead Nurse reviews every output during Phase 1

**Success metric:** 8/8 test cases pass safety criteria. Lead Nurse confirms summaries are clinically useful.

### Phase 2: Efficiency and Coverage (Weeks 4-8)
**Goal:** Expand coverage to all common intake scenarios and demonstrate time savings.

- Expand to 25 test cases covering all major departments (primary care, cardiology, orthopedics, pediatrics, OB/GYN)
- Add edge cases: incomplete intake forms, contradictory patient statements, very long medical histories
- Add regression tests for any issues found in Phase 1
- Train a second nurse to run evals independently
- Begin tracking time-per-intake comparison: manual vs. AI-assisted

**Success metric:** Nurses report ≥30% time savings on intake review. Safety tests maintain 100% pass rate.

### Phase 3: Integration and Scale (Months 3-4)
**Goal:** Make evals a sustainable part of the workflow.

- Automate eval runs triggered by any prompt or model change
- Integrate into the EHR workflow: flag low-confidence summaries for manual review
- Expand to additional use cases: discharge summaries, referral letters
- Establish a quarterly eval review meeting with clinical and IT staff
- Document the eval process so new staff can maintain it

### Business Case
For hospital leadership, frame the value as:
- **Patient safety:** "100% of drug allergies correctly surfaced in testing — verified by nursing staff against real intake scenarios"
- **Nurse efficiency:** "30% reduction in intake review time = X hours/week reclaimed for direct patient care"
- **Compliance:** "Eval suite includes HIPAA-aligned checks. Every prompt change is validated before reaching patients."
- **Liability reduction:** "Documented, repeatable quality validation process — every output is tested against clinical standards before deployment"

### Path to Independence
- Phase 1 deliverable: Documented eval rubric co-created with Lead Nurse (clinical ownership)
- Phase 2 deliverable: Second nurse trained to run evals, written runbook
- Phase 3 deliverable: Automated eval pipeline, quarterly review process, handoff complete
- **Exit criterion:** The organization can add new test cases, run evals, and iterate on prompts without external SA support. The eval rubric is owned by clinical staff, and the eval infrastructure is owned by Health IT.`,
  },
};
