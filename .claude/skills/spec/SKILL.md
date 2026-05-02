---
name: spec
description: Create a new feature specification using the project spec-driven template
---

You are responsible for creating a new feature specification.

## Goal

Generate a new spec following the project standard and save it at:

/docs/specs/<feature>/SPEC.md

---

## Instructions

1. Extract the feature name from the user command
2. Normalize the feature name to kebab-case
3. Create the folder `/docs/specs/<feature>/` if it does not exist
4. Create a file `SPEC.md` inside it

---

## Spec format (STRICT)

Follow EXACTLY this structure:

# Feature: <feature-name>

## Summary

<short description of the feature and its purpose>

---

## Behaviors

- When <action>, then <expected behavior>
- When <action>, then <expected behavior>

---

## Rules

- <business or validation rule>
- <restriction>

---

## Edge Cases

- <error scenario>
- <invalid input>

---

## Acceptance Criteria

- [ ] <testable condition>
- [ ] <testable condition>

---

## Writing rules

- Keep it concise and practical
- Do NOT include implementation details
- Do NOT mention frameworks, libraries, or file structure
- Focus on behavior and business rules
- If input is incomplete, make minimal assumptions
- Always include at least:
  - 3 behaviors
  - 3 rules
  - 3 edge cases
  - 3 acceptance criteria

---

## Output rules

- Output ONLY the final SPEC.md content
- Do not explain anything
- Do not include extra commentary
- Ensure formatting is clean and consistent
