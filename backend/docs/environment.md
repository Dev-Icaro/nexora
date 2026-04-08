# Environment Variables

The project uses a centrilized schema object to type and validate the environment
variables using zod schema the object is located at @/config/environment.ts

## Envs explanation

`MONGODB_URI` Mongo DB connection URI.

## Rules

- Never hardcode environment variables
- Always access variables through a config layer
- Do not use `process.env` directly in business logic
- Validate all required variables on application startup
