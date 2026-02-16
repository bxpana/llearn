export interface Annotation {
  text: string;
  note: string;
}

export interface PromptExample {
  systemPrompt?: string;
  userMessage: string;
  assistantResponse: string;
  annotations?: Annotation[];
}

export type ValidationRuleType =
  | "contains"
  | "not-contains"
  | "min-length"
  | "has-section"
  | "regex";

export interface ValidationRule {
  type: ValidationRuleType;
  value: string | number;
  message: string;
}

export interface Exercise {
  instructions: string;
  starterCode: string;
  hints: string[];
  validation: ValidationRule[];
  sampleSolution: string;
}

export interface LessonContent {
  explanation: string;
  whyItMatters: string;
  keyPrinciples: string[];
}

export interface LessonExample {
  scenario: string;
  bad?: PromptExample;
  good: PromptExample;
}

export interface Lesson {
  slug: string;
  title: string;
  description: string;
  order: number;
  content: LessonContent;
  example: LessonExample;
  exercise: Exercise;
}

export interface Module {
  slug: string;
  title: string;
  description: string;
  icon: string;
  lessons: Lesson[];
  comingSoon?: boolean;
}

export interface ValidationResult {
  passed: boolean;
  results: {
    rule: ValidationRule;
    passed: boolean;
  }[];
}

export interface LessonProgress {
  completed: boolean;
  lastAttempt?: string;
}

export type ModuleProgress = Record<string, LessonProgress>;
export type AllProgress = Record<string, ModuleProgress>;
