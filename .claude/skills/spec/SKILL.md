---
name: spec
description: Create a feature specification from a Trello card (HU format) using the project spec-driven template
---

You are responsible for creating a new feature specification based on a Trello card.

## Goal

Read a Trello card provided in the command and generate a complete SPEC.md following the project standard.

The spec must be saved at:

/docs/specs/<feature>/SPEC.md

---

## Trigger format

Command example:

/spec https://trello/...

---

## Required input

- Trello card URL provided in the command

---

## 🚨 Data Source (MANDATORY)

The agent MUST use the MCP (Model Context Protocol) from Composio to retrieve the Trello card content.

### Rules

- DO NOT rely on user-pasted content
- DO NOT assume card content
- DO NOT proceed without fetching the card

### Expected behavior

1. Use Composio MCP Trello integration
2. Fetch:
   - Card title
   - Card description
   - Any structured content inside the card
3. Use the retrieved content as the SINGLE source of truth

If the card cannot be retrieved:
→ The agent MUST stop and report failure

---

## HU Structure (expected)

The Trello card will usually contain:

- Title (HU — <feature name>)
- Descrição (Como / Eu quero / Para)
- Regras de negócio
- Critérios de aceitação (CAxx)

---

## Instructions

1. Fetch the Trello card using Composio MCP
2. Read and parse the full card content
3. Extract the feature name from the card title
4. Normalize the feature name to kebab-case
5. Create the folder `/docs/specs/<feature>/` if it does not exist
6. Create a file `SPEC.md` inside it
7. Convert the HU into the Spec format

---

## 🚨 CRITICAL CONVERSION RULES (MANDATORY)

### 1. No information loss

- ALL information from the HU MUST be preserved
- DO NOT summarize away important details
- DO NOT omit any rule or acceptance criteria
- DO NOT invent requirements not present in the HU

---

### 2. Description → Summary

Transform:

Como <tipo de usuário>  
Eu quero <ação>  
Para <objetivo>

Into a clear summary of the feature purpose.

---

### 3. Regras de negócio → Rules

- Convert ALL business rules into the Rules section
- Keep security, validation, limits, and constraints explicit
- Do NOT merge or remove rules

---

### 4. Critérios de aceitação → Acceptance Criteria

- Convert EACH CA into a checklist item
- Preserve intent and testability
- Do NOT merge multiple CAs into one
- Keep them explicit and verifiable
- ALWAYS keep the original CA id (CA01, CA02, etc.)

---

### 5. Behaviors generation

- Derive behaviors from:
  - Description
  - Rules
  - Acceptance Criteria
- Behaviors must represent real system interactions

---

### 6. Edge Cases generation

- Derive from:
  - Rules (validation, security)
  - Failure scenarios
  - Abuse scenarios
- Must include realistic negative scenarios

---

## Spec format (STRICT)

Follow EXACTLY this structure:

# Feature: <feature-name>

## Summary

<derived from HU description>

---

## Behaviors

- When <action>, then <expected behavior>
- When <action>, then <expected behavior>

---

## Rules

- <business rule from HU>
- <business rule from HU>

---

## Edge Cases

- <error scenario>
- <invalid input>
- <abuse/security scenario>

---

## Acceptance Criteria

- [ ] CA01 - <testable condition>
- [ ] CA02 - <testable condition>

---

## Writing rules

- Keep it concise but complete
- Do NOT include implementation details
- Do NOT mention frameworks, libraries, or file structure
- Preserve ALL business logic from the HU
- Use clear and testable language
- Do NOT generalize security rules
- Do NOT remove constraints like expiration, rate limit, etc.

---

## Output rules

- Output ONLY the final SPEC.md content
- Do not explain anything
- Do not include extra commentary
- Ensure formatting is clean and consistent
- Ensure ZERO information loss from the HU
- Ensure Trello is the only source of truth
