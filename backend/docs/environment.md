# Environment Variables

The project uses a centrilized schema object to type and validate the environment
variables using zod schema the object is located at @/config/environment.ts

## Envs explanation

`MONGODB_URI` Mongo DB connection URI.

`NODE_ENV` Application environment. Accepted values: `development`, `production`, `test`. Defaults to `development`.

`LOG_LEVEL` Minimum log level to output. Accepted values: `error`, `warn`, `info`, `http`, `verbose`, `query`, `debug`, `silly`. Defaults to `info`.

`LOG_SILENT` When `true`, suppresses all log output. Defaults to `false`.

## Rules

- Never hardcode environment variables
- Always access variables through a config layer
- Do not use `process.env` directly in business logic
- Validate all required variables on application startup
- Always add new environment variables to `env.example`
