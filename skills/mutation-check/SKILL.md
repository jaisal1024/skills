---
name: mutation-check
description: >-
  Prove that tests catch regressions: break each behavior of a change on
  purpose, one at a time, run the tests that should notice, and report which
  breaks they miss. Works at every test layer: unit, database, integration,
  API, browser end-to-end, and model evals. Use when the user asks whether
  tests "actually do something", asks for mutation testing, chaos tests, or
  negative test checks, says "break the code and see if the tests catch it",
  or after a bug fix or new test when the evidence must show that the test
  fails without the fix.
---

# Mutation check

A passing test proves nothing until a broken implementation makes it fail. This skill breaks
the code under test on purpose, one change at a time, and records which tests notice.

## Load project context

Read applicable repository instructions. Find the test commands in package manifests, CI
workflows, and testing docs, and verify them against the checkout. Follow the repository's own
testing standards; this skill adds a workflow only.

## Workflow

### 1. List the behaviors

Read the diff against the base: `git diff origin/<base>...HEAD`. List each behavior the change
adds or fixes. Ignore tests, docs, formatting, and moved code. One behavior gets one mutation.

### 2. Plan the mutations

For each behavior, start with a revert to the base code. A revert proves that the tests fail
without the change. Then add mutations for new logic: flip a condition, drop a guard, skip a
call, widen a filter. Read [`references/mutations.md`](references/mutations.md) for the catalog.

Each mutation must still compile and start. A type error or a crash at load fails every test,
which proves nothing about the behavior.

### 3. Pick the tests that should notice

Find the layer that owns each behavior, and the narrowest command that runs its tests. Read
[`references/layers.md`](references/layers.md) for what to mutate and how to run each layer.

An API, end-to-end, or eval run can take minutes, need running services, or cost money. State
the cost and ask before you run many of them.

### 4. Run each mutation alone

Run the chosen tests once without a mutation. They must pass. Then, for each mutation:

1. Copy the file to a scratch directory outside the repository before you change it.
2. Make the one change.
3. For a layer that runs against a server, confirm the server reloaded the change.
4. Run the tests and record the result and the failing test names.
5. Copy the saved file back.

The copy keeps uncommitted work safe. Do not use `git stash`: the stash stack is shared with
other worktrees and sessions. After the last mutation, confirm that `git diff` shows only your
intended changes.

### 5. Triage each survivor

A survivor is a behavior that no test checks. For each one, do one of these:

- Add a test at the cheapest layer that decides the behavior, following the repository's
  testing conventions. Run the mutation again and confirm that the new test fails.
- State why the mutation is equivalent: the mutated code has the same observable behavior.
- Delete the code if no caller depends on the behavior. Ask first.

### 6. Check the catches

A catch counts only when an assertion fails for the reason you expect. Read the failure
message. A timeout, an import error, or a crash in setup is a weak catch. Write a sharper
assertion if the failure does not name the behavior.

If a test depends on timing, real scheduling, or a live service, run it several times before
you trust it.

### 7. Report

Report a table of mutation, result, and the test that caught it. In a PR, add one line to the
validation section, for example: "Mutation check: reverting any one of the 5 changes fails at
least one test." List any survivor you accepted as equivalent, with the reason.
