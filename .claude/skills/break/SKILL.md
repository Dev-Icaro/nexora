---
name: break
description: Break a feature specification into small task files grouped by Prototype, Backend, and Frontend Integration
---

You are responsible for breaking a feature specification into executable tasks.

## Goal

Read the feature specification and generate task files grouped into three execution concepts:

1. Prototype
2. Backend
3. Frontend Integration

Tasks must be created at:

/docs/specs/<feature>/tasks/<ordered-semantic-task-name>.md

Example:

- `01-prototype-reset-password-form.md`
- `02-backend-request-password-reset.md`
- `03-backend-reset-password.md`
- `04-integrate-reset-password-form.md`

---

## Required input

- Feature name from command
- Read `/docs/specs/<feature>/SPEC.md`

---

## Execution concepts

### 1. Prototype

Use this group only when the feature includes frontend UI.

Prototype tasks are responsible for implementing only the visual and interaction prototype based on the SPEC design requirements.

Prototype tasks may include:

- Page/component structure
- Layout
- Form fields
- Buttons
- Empty states
- Loading states
- Error/success visual states
- Static mock behavior

Prototype tasks must NOT include:

- Real API calls
- Backend integration
- Mutations
- Queries
- Real persistence
- Business logic
- Authentication or authorization logic

The prototype must be usable with mocked/local/static state only.

#### 🚨 Design Link Rule (MANDATORY)

If the SPEC contains any design reference (Figma, image, link, or similar):

- The agent MUST include the design link in the task file
- The agent MUST explicitly state that the implementation must follow the design
- The agent MUST NOT ignore, approximate, or reinterpret the design

This rule is mandatory for all Prototype tasks.

---

### 2. Backend

Backend tasks are responsible for implementing only the server-side behavior required by the SPEC.

Backend tasks may include:

- Endpoints
- GraphQL queries/mutations
- DTOs/input validation
- Use cases/services
- Database persistence
- Domain/business rules
- Server-side authorization
- Error handling
- Tests related to backend behavior

Backend tasks must NOT include:

- Frontend components
- UI behavior
- Client-side integration
- Styling

---

### 3. Frontend Integration

Frontend Integration tasks are responsible for connecting the already-created prototype to the backend behavior.

Frontend Integration tasks may include:

- Calling backend endpoints/mutations/queries
- Replacing mocked state with real data
- Form submission logic
- Loading/error/success handling with real responses
- Cache updates
- Redirects/navigation after success
- Client-side validation connected to real flows

Frontend Integration tasks must NOT include:

- Creating backend behavior
- Redesigning the prototype
- Adding unrelated UI changes
- Inventing requirements outside the SPEC

---

## Instructions

1. Read and understand the full `SPEC.md`
2. Identify whether the feature requires:
   - Prototype tasks
   - Backend tasks
   - Frontend Integration tasks
3. Detect if there is any design reference in the SPEC
4. Break the feature into small, atomic, sequential tasks
5. Order tasks by execution flow:
   - Prototype first, when applicable
   - Backend second, when applicable
   - Frontend Integration last, when applicable
6. Create folder `/docs/specs/<feature>/tasks/` if it does not exist
7. Create one file per task
8. Each file name must:
   - be kebab-case
   - describe the task responsibility
   - start with a two-digit execution prefix
   - include the concept prefix when applicable:
     - `prototype`
     - `backend`
     - `integrate`
   - avoid generic names like `task-1.md`
9. Keep each task file minimal
10. Do NOT include implementation planning
11. Do NOT include dependencies, done criteria, scope breakdown, or technical details
12. Do NOT invent requirements outside the SPEC

---

## Task design rules

- Each task must represent a single responsibility
- Tasks must be small enough to plan and execute independently
- Prefer separating prototype, backend, and integration responsibilities
- Do NOT mix backend implementation with frontend integration
- Do NOT mix prototype work with real data integration
- Keep task descriptions concise
- Leave all detailed reasoning for `/plan`
- If the SPEC does not require one of the three concepts, do not create tasks for that concept
- If a design reference exists, ALL Prototype tasks must strictly follow the Design Link Rule

---

## Required structure for EACH task file

# Task: <short title>

## Type

<Prototype | Backend | Frontend Integration>

## Description

A short and clear description of what this task must deliver.

## Design Reference (only for Prototype tasks when available)

<design link>

Implementation MUST strictly follow the provided design.

## Derived From

- Behaviors: <relevant behavior(s)>
- Rules: <relevant rule(s)>
- Acceptance Criteria: <relevant acceptance criteria>

---

## Output rules

- Create multiple files, one per task
- Use ordered semantic file names
- Do NOT use generic file names like `task-1.md`
- Keep each file short and minimal
- Do NOT include explanations outside task content
- Ensure all tasks together cover the full `SPEC.md`
- Ensure tasks are grouped logically by Prototype, Backend, and Frontend Integration
- Ensure Design Reference is included whenever available in Prototype tasks
