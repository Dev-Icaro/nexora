# Feature: login-page

## Summary

A login page where unauthenticated users can authenticate using their email and password to access features that require prior authentication.

---

## Behaviors

- When the user fills in the password field, the characters are hidden by default
- When the user clicks the toggle to show password, the hidden characters become visible
- When the user submits the form with valid credentials, they are authenticated and redirected to the home screen
- When the user submits the form with invalid or empty fields, validation messages are displayed on the corresponding fields
- When the user submits the form with incorrect credentials, a generic error message is shown without specifying which field is wrong
- When the user is authenticated, their session persists while navigating through the application

---

## Rules

- The user must provide an email that is already registered in the application
- The provided password must match the registered email
- The system must not reveal whether the error was in the email or the password (security)
- After a successful authentication, the user's session must be initiated
- The user must be able to toggle visibility of the password field

---

## Edge Cases

- User submits with an empty email or password field
- User submits with a valid email format but no corresponding account
- User submits with a correct email but wrong password — system responds with a generic error
- Session expires while the user is navigating — behavior should handle gracefully

---

## Acceptance Criteria

- [ ] User can fill in the email field with a valid email
- [ ] User can fill in the password field
- [ ] Password characters are hidden by default and can be toggled to visible
- [ ] Submitting with empty or invalid fields shows validation messages on each field
- [ ] Submitting with incorrect credentials shows a single generic error message (not field-specific)
- [ ] Submitting with valid credentials authenticates the user and redirects to the home screen
- [ ] Authenticated session persists while the user navigates the application
