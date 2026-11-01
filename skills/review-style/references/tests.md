# Tests

Read this for unit, DB, API, and end-to-end tests. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## Mocked tests do not prove a critical path

Ask for `/mutation-check`. Name the real tests to add: the route edge cases (wrong owner, bad body), the exact scenario the PR fixes, and an exploratory QA pass for a user flow.

## End-to-end tests must survive client retries

The frontend retries failed calls. Make sure a test still passes when the first call fails and a retry succeeds. Use the shared wait helper for every API wait.

## An end-to-end test drives the real system

Do not add a shim endpoint or a direct DB call to force a state. If the real system cannot reach the state, drop the test.

## Cut a test that proves nothing new

Ask to remove a test that repeats another test's case, or that only checks a mock returns what the test told it to return.

## No silent fallbacks in assertions

Do not fall back to an empty value. Assert that the value is defined and not empty.

## Wait for late elements

Ask whether an element can appear late, and whether the test waits for it.

## Use the shared test setup

Use the setup the test suite already has, for example an in-memory store, instead of a new service in CI.

## Keep test helpers simple

Remove logic a test helper does not need.

## Keep seeds and their docs current

When a PR changes seed data, ask whether other environments need it and whether the docs still match.
