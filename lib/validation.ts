import { ValidationRule, ValidationResult } from "./types";

export function validate(
  input: string,
  rules: ValidationRule[]
): ValidationResult {
  const results = rules.map((rule) => ({
    rule,
    passed: checkRule(input, rule),
  }));

  return {
    passed: results.every((r) => r.passed),
    results,
  };
}

function checkRule(input: string, rule: ValidationRule): boolean {
  const text = input.trim();

  switch (rule.type) {
    case "contains":
      return text.toLowerCase().includes(String(rule.value).toLowerCase());

    case "not-contains":
      return !text.toLowerCase().includes(String(rule.value).toLowerCase());

    case "min-length":
      return text.length >= Number(rule.value);

    case "has-section": {
      const tag = String(rule.value);
      return text.includes(tag);
    }

    case "regex":
      return new RegExp(String(rule.value), "i").test(text);

    default:
      return false;
  }
}
