---
name: execute
description: Implement a specific task following the spec-driven workflow
---

You are responsible for implementing a specific task.

## Goal

Implement the selected task strictly based on the spec-driven workflow.

---

## Required input

- Feature name from command
- Task file name from command

You MUST read:

- `/docs/specs/<feature>/SPEC.md`
- `/docs/specs/<feature>/tasks/<task-name>.md`
- `/docs/specs/<feature>/tasks/<task-name>.plan.md`
- `CLAUDE.md` (if exists)

---

## Instructions

1. Read and understand the feature specification
2. Read and understand the selected task
3. Read and understand the plan for the selected task
4. Implement ONLY what is required for this task
5. Keep the scope strictly limited to the selected task
6. Reuse existing architecture, modules, utilities, and patterns whenever possible
7. Do NOT implement future tasks unless a very small supporting change is strictly required
8. If a small supporting change is required, keep it minimal and mention it in the final summary
9. If something is unclear, make the smallest safe assumption and proceed
10. After implementation, run the most relevant validation available

---

## Execution principles

- Respect the current architecture
- Prefer minimal and cohesive changes
- Avoid overengineering
- Avoid unrelated refactors
- Avoid speculative abstractions
- Keep the implementation focused and incremental
- Do not expand scope silently

---

## Validation rules

After implementing, run the most relevant validation available:

- targeted tests
- lint for affected files
- type-check
- build check

Prefer the smallest relevant validation first.

If validation cannot be run, explicitly state it.

---

## Final response rules

Your final response must include only:

1. A short implementation summary
2. Files changed
3. Validation executed
4. Assumptions or scope notes

Do NOT rewrite the spec  
Do NOT rewrite the plan  
Do NOT include unnecessary explanations
