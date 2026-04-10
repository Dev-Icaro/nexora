# Architecture

These document explain how the main points of architecture works on these project
separated by section.

---

## 1.0 Tech Stack

Frontend tech stack uses:

- Vite (build tool)
- React
- Typescript
- Apollo Client (GraphQL Client)

The application communicates with a GraphQL API and relies on Apollo Client for data management and caching.

---

## 2.0 Styling

For styling we always use TailwindCSS as CSS framework.

We follow a utility-first approach and avoid custom CSS whenever possible.

---

## 3.0 Component Library

For component library we use ShadCN UI.

All base UI components should live inside:

src/shared/components/ui/

Example:

src/shared/components/ui/button.tsx

These components must be:

- Stateless
- Reusable
- Free of business logic

---

## 4.0 Testing

For testing we use:

- Vitest
- Testing Library (for component behavior)

Tests should focus on:

- User behavior (not implementation details)
- Feature-level interactions

---

## 5.0 Data Fetching

For data fetching we use Apollo Client with:

- useQuery
- useMutation

GraphQL operations must be organized by feature:

features/<feature>/api/

Example:

features/auth/api/login.mutation.ts  
features/post/api/get-posts.query.ts

### Rules

- Never call GraphQL directly inside components
- Always wrap operations inside hooks or feature services
- Prefer refetchQueries initially, evolve to cache.update when needed

---

## 6.0 Project Structure

We follow a feature-first architecture.

src/
app/
pages/
features/
shared/

### Responsibilities

#### app/

Application-level configuration:

- Providers (Apollo, Auth, Router)
- Layouts
- Global wrappers

#### pages/

Route entry points.

Pages must be thin and only responsible for:

- Layout composition
- Calling feature components

#### features/

Core business logic organized by domain.

Example:

features/
auth/
post/
comment/

Each feature contains:

api/ -> GraphQL operations  
components/ -> UI tied to the feature  
hooks/ -> orchestration logic  
state/ -> local/global state (if needed)  
utils/ -> helpers specific to the feature

#### shared/

Reusable code across the entire app.

shared/
components/
hooks/
lib/
utils/
types/
constants/

---

## 7.0 State Management

We use a combination of:

### 1. React Context + Reducer (Global State)

Used only for:

- Authentication
- Session management

Location:

features/auth/state/

Includes:

- auth-context.tsx
- auth-reducer.ts

### 2. Apollo Client (Server State)

Used for:

- Posts
- Comments
- Likes
- Any remote data

Rules:

- Server is always the source of truth
- Do not duplicate server state in React state

---

## 8.0 Authentication Flow

Authentication is handled manually using:

- GraphQL mutations (login, register)
- JWT token storage

Flow:

1. User logs in or registers
2. API returns token + user
3. Token is stored (localStorage or similar)
4. AuthContext is updated
5. User is redirected

Apollo Client must automatically attach the token to requests.

Protected routes must validate authentication state.

---

## 9.0 Separation of Concerns

We enforce clear separation:

- Components → UI only
- Hooks → behavior and orchestration
- API layer → GraphQL communication
- State → global/shared state only when necessary

---

## 10.0 General Rules

- Do not mix business logic inside UI components
- Do not access GraphQL directly from pages/components
- Prefer feature isolation over global abstractions
- Keep shared folder minimal and generic
- Use TypeScript types for all API responses
-

## 11.0 Form Validation

All forms in the application must use React Hook Form as the default form library.

Form UI integration must always be done using the ShadCN UI `Form` components.

This pattern ensures:

- Consistent form structure across the application
- Better scalability for complex forms
- Easy integration with validation libraries
- Better maintainability and readability

### Rules

- Always use `react-hook-form` for form state management
- Always use ShadCN UI `Form` wrapper and related form components
- Avoid managing form state manually with `useState` for standard forms
- Keep validation logic close to the form definition
- Prefer schema-based validation when possible

### Recommended structure

Forms should normally be organized inside the related feature:

features/<feature>/components/

Example:

features/auth/components/login-form.tsx  
features/auth/components/register-form.tsx

### Integration pattern

A form should usually include:

- `useForm` from React Hook Form
- `Form` from ShadCN UI
- `FormField`
- `FormItem`
- `FormLabel`
- `FormControl`
- `FormMessage`

This should be the default standard for all new forms in the project.
