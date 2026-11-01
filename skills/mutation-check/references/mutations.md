# Mutations

## Catalog

Start with the revert. Add the others for logic the revert does not isolate.

| Kind             | Mutation                                                 | Proves that a test checks |
| ---------------- | -------------------------------------------------------- | ------------------------- |
| Revert           | Replace the new code with the base code                  | The change itself         |
| Flip a condition | `if (a)` becomes `if (!a)`, `<` becomes `<=`             | The branch and its edge   |
| Drop a guard     | Remove an early `return`, a `throw`, or an auth check    | The rejected input        |
| Skip a call      | Delete a side effect, such as a dispatch, a write, a log | The side effect           |
| Swap a value     | Change a constant, a default, a status code, or a copy   | The exact value           |
| Widen a filter   | Remove a `WHERE` clause, a scope, or a `.filter`         | The scoping               |
| Break identity   | Return a new object with equal content                   | Reference equality        |

For authorization, tenant scoping, and access to sensitive data, always add a "widen a filter"
mutation. A test that cannot tell a scoped query from an unscoped one does not protect the
access rule.

## Why a mutation survives

| Cause                                                        | Fix                                                  |
| ------------------------------------------------------------ | ---------------------------------------------------- |
| The test reads a different part of the state than the change | Assert on the output the change produces             |
| A higher-layer test covers several changes but observes one  | Add a test per behavior at the layer that decides it |
| The test mocks the unit under test                           | Mock only the boundary                               |
| The assertion is too loose, for example `toBeDefined()`      | Assert on a literal value                            |
| The fixture hides the case, for example an empty list        | Add the case that exercises the branch               |
| The server or app did not reload the mutation                | Confirm the reload, then run again                   |
| The mutation is equivalent                                   | Record why, and drop it                              |

## Fixtures that make an "equal" check flaky

A mutation check often needs a test that builds the same data twice and expects equal results.
Shared mocks can stamp the current time or random ids, so two builds differ by a millisecond.
Pass fixed values for every timestamp and id the mock generates.
