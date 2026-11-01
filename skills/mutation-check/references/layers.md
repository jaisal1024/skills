# Mutations by layer

Mutate the code that the layer's tests exist to protect. Run only the tests that should notice,
using the narrowest command the project provides for that layer.

## Unit

- **Mutate:** the module's logic. Branches, transforms, reducers, parsers, validation.
- **Run:** the unit test command with the test path. A run takes seconds, so check every
  mutation.
- **False result:** the test mocks the module you mutated. The mock hides the change, so the
  mutation survives for the wrong reason. Mutate the real unit, and mock only its boundaries.

## Database

- **Mutate:** the query. Remove a `WHERE` clause or a tenant scope, change a join, change a
  JSON merge, drop an `ON CONFLICT` target.
- **Run:** the database test command with the test path.
- **False result:** the seed holds only the rows the query should return, so a widened filter
  returns the same rows. Seed a second user or a second organization that the query must
  exclude.
- Prefer a query mutation to a migration mutation. A migration mutation needs the test
  database migrated again, and a reset afterward.

## Integration

- **Mutate:** one step of the flow. Skip a write, swap two steps, drop an idempotency key, or
  remove a retry.
- **Run:** the integration test command with the test path.
- **False result:** a later step repairs the state that the mutated step broke. Assert on the
  state after the mutated step, not only at the end of the flow.

## API

- **Mutate:** the route handler. Loosen the request schema, remove an auth or scoping check,
  change a status code, or add a field to the response allowlist.
- **Run:** the API test command with the test path, against a local server.
- **False result:** the server did not reload the mutated file, so every mutation survives.
  Confirm the reload in the server log, or with one request, before you run the tests.

## End-to-end

- **Mutate:** behavior the user sees. Disable a handler, change a redirect target, hide a state,
  or change copy that a spec asserts on.
- **Run:** one spec against a dev server with hot reload. Ask first if the run is long.
- **False result:** a mutation that breaks only a locator, such as a renamed test id, fails the
  spec without proving that it checks the behavior. Mutate the behavior, not the selector.

## Model evals

- **Mutate:** a prompt instruction, a tool result, or a guardrail rule.
- **Run:** the eval command with the eval path. Each run calls a model and costs money, so
  ask first and keep the mutation list short.
- **False result:** model output varies between runs. Run the base and each mutation more than
  once, and compare the scores, not one pass or fail.

## Configuration and flags

- **Mutate:** a gate default, an env default, or a feature flag check.
- **Run:** the tests of the layer that reads the value.
- **False result:** the test sets the value itself, so the default never takes effect. Check
  that at least one test runs with the default.
