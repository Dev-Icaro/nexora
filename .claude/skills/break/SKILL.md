---
name: break
description: Break a feature specification into small task files with minimal content
---

You are responsible for breaking a feature specification into executable tasks.

## Goal

Read the feature specification and generate individual task files at:

/docs/specs/<feature>/tasks/<ordered-semantic-task-name>.md

Example:

- `01-setup-auth-foundation.md`
- `02-implement-credentials-login.md`
- `03-implement-social-login.md`

---

## Required input

- Feature name from command
- Read `/docs/specs/<feature>/SPEC.md`

---

## Instructions

1. Read and understand the full SPEC.md
2. Identify the main responsibilities inside the feature
3. Break the feature into small, atomic, sequential tasks
4. Create folder `/docs/specs/<feature>/tasks/` if it does not exist
5. Create one file per task
6. Each file name must:
   - be kebab-case
   - describe the task responsibility
   - start with a two-digit execution prefix
   - avoid generic names like `task-1.md`
7. Keep each task file minimal
8. Do NOT include implementation planning
9. Do NOT include dependencies, done criteria, scope breakdown, or technical details
10. Do NOT invent requirements outside the spec

---

## Task design rules

- Each task must represent a single responsibility
- Tasks must be small enough to plan and execute independently
- Prefer vertical slices over technical layers
- Keep task descriptions concise
- Leave all detailed reasoning for `/plan`

---

## Required structure for EACH task file

# Task: <short title>

## Description

A short and clear description of what this task must deliver.

## Derived From

- Behaviors: <relevant behavior(s)>
- Rules: <relevant rule(s)>
- Acceptance Criteria: <relevant acceptance criteria>

---

## Output rules

- Create multiple files (one per task)
- Use ordered semantic file names
- Do NOT use generic file names like `task-1.md`
- Keep each file short and minimal
- Do NOT include explanations outside task content
- Ensure all tasks together cover the full SPEC.md
