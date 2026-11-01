---
name: review-style
description: Review a pull request or diff with the reviewer's code review rules and voice, sorted by the kind of code the PR touches. Use when you review a pull request or a diff, draft review comments, decide what is blocking, or write review findings. It covers rollout and feature flags, database changes, backend and API contracts, async tasks and queues, frontend and client/server state, AI prompts and model upgrades, and tests, and it posts approved comments only as a pending review.
---

# Review style

This skill is how the reviewer reviews code. Use it to find the comments the reviewer would leave, and to write them in the reviewer's voice. The reviewer is the user who runs the skill and the signed-in `gh` user.

## Local store

The shared references hold rules only. The reviewer's own examples, extra rules, and sync state live outside the installed skill, so they stay private and survive skill updates:

```sh
REVIEW_STYLE_HOME="${REVIEW_STYLE_HOME:-$HOME/.agents/review-style}"
```

The store holds one file per reference name (for example `backend.md` or `voice.md`) and `state.json`. `review-style-update` builds it from the reviewer's past reviews. When the store is absent, use the shared rules alone.

When a store file exists for an area, read it after the shared reference. A local rule adds to the shared rules. When a local rule contradicts a shared rule, follow the local rule and say so in your notes.

## How to use the examples

Local examples come from the reviewer's past reviews, often in one repository. Use them to learn the kind of concern and the voice. Do not use them as a list of things to find.

- Apply the rule above each example. Do not look for the systems, tables, flows, or bugs that the example names.
- Raise a finding only when the code in front of you shows the problem. A match with an example is not evidence.
- A helper name in an example is that repository's name. In another repository, find the local equivalent. If there is none, state the rule without the name.
- Do compare the PR with its own sibling code. The guard is against the example's names, not against the repository's conventions.
- Never copy the items of an example list, such as a checklist. Build the list from the PR's own code paths.
- Do not copy the domain words of an example into a comment on a different domain.
- An area with few examples has thin source data. That does not mean the reviewer cares less about the area.

## Workflow

1. List the areas the PR touches. Use the area map below.
2. Read `references/voice.md`. Then read the reference for each area in the map, and the matching local store files.
3. Read `references/rollout.md` for every PR that changes behavior for existing users, clients, or data.
4. Review the architecture first. Look for the mechanism the change depends on and the assumptions it makes.
5. Check each finding against the code before you write it. State a concrete scenario, not a worry.
6. Do the existing-code search. Follow "Search for existing code" below for each new function, file, workflow step, and inline script.
7. Do the hygiene pass. Read `references/hygiene.md`, then read each changed hunk again for those items only. Give each one the nit tier, or non-blocking when it changes behavior.
8. Sort the findings into blocking and non-blocking. Every finding goes inline. Hygiene nits go inline only.
9. Draft the inline comments in the voice. Then write the body last, and only when there is one thing to say that no inline comment says: the one must-fix, the condition of the approval, or a numbered scenario for a correctness bug. Do not restate the inline comments in the body. Do not put CI status in the body. Refer to "Review bodies" in `references/voice.md`.
10. Show the draft to the reviewer in the format of "Post as a pending review" below. Post nothing until the reviewer approves the final list.
11. Cut each comment to one sentence where you can. Keep the evidence in your notes, not in the comment.

## Search for existing code

Reviewers often write "we already have this logic" or "can we reuse that?". To make these comments, search the repository at the PR head. Do not rely on what you remember.

1. List each new function, class, hook, file, workflow job or step, and inline script of more than about 10 lines in the diff.
2. For each one, write down what it does in a few words, for example "wait for the first reply" or "post a comment to a PR".
3. Search for code that already does that. Grep for the key calls it makes, the strings or selectors it uses, and likely names. Search the shared packages, the sibling apps, and the folders next to the new code.
4. When a match exists, comment with the file and name: "we already have X in Y, can we reuse that?" Say "i think" when the match is close but not exact.
5. When a new block does several unrelated jobs, or a large inline script sits in a config file, ask to move it to its own file next to its callers.
6. When you cannot tell what a block does after you read it and its callers, ask "what does this do?". Do not guess.

Spend this search on the new code only. Do not search for every changed line.

## Area map

| Signals in the diff | Reference |
| --- | --- |
| Feature flags, gates, env vars, removed handlers, behavior changes for existing users | `references/rollout.md` |
| Migrations, SQL, query builders, transactions, locks, indexes, jsonb columns | `references/database.md` |
| API routes, request and response schemas, public docs, error handling, caching, new apps or services, config, build scripts | `references/backend.md` |
| Queue consumers, task handlers, workflows, webhooks, fan-out, idempotency keys | `references/async-tasks.md` |
| Components, hooks, client state, client-side copies of server rules | `references/frontend.md` |
| Prompts, agents, model or SDK upgrades, eval changes, LLM output limits | `references/ai-prompts.md` |
| Unit, DB, API, and end-to-end tests, mocks, retries in tests | `references/tests.md` |
| Every PR, after the architecture pass | `references/hygiene.md` |

A PR usually touches more than one area. Read every reference that applies.

## Core rules

These rules apply to every PR, whatever the area.

- **The server owns decisions.** The client renders what the server returns. A client-supplied flag must not control a server rule. A client must not re-derive a rule that the server already computes.
- **Use what exists.** Name the existing helper, hook, route, or pattern. Prefer a REST sub-resource to a new RPC-style endpoint.
- **Ask why it is needed.** Push on new state, new branches, new functions, and new endpoints. If it is not needed, ask to remove it.
- **Fix the root cause.** Call a workaround a code smell, and ask for the fix at its source. Accept a short-term check if the author files a ticket for the root fix.
- **Make every rollout reversible.** Keep a gate for new behavior. Ship the producer before you remove the consumer. Think about old client tabs and in-flight data.
- **Make concurrency safe.** A check-then-act outside a lock is a race. At-least-once delivery needs an idempotency key.
- **One transaction per unit of work.** For every handler that makes more than one DB write, ask for one transaction. A DB action takes the transaction as an argument.
- **Make failures visible.** Never return a silent success on failure. Log, emit a metric, alert on error rates, and show the user an error. Add a log that tells on-call what to do.
- **Every log and metric earns its cost.** A failure state gets a custom metric, even when it already logs or sends an alert. Cut a routine log or metric that nobody will chart, alert on, or read. A metric or outcome name says what happened.
- **New code follows its sibling code.** Compare it with how the same repository already does the same thing: layout, config, helpers, and tests.
- **Watch the cost.** Flag N+1 calls, full fetches where a HEAD request is enough, unbounded growth, and anything that breaks a cache.

## Blocking or not

Block on these:

- A race or ordering problem that gives a wrong result.
- A rollout that breaks old clients, in-flight data, or existing integrations, or that has no way back.
- A new route that skips a guard its sibling routes run, such as a kill switch, a pause check, or an ownership check.
- A private channel, key, or field that a user can reach.
- A silent wrong success, for example a 200 on a timeout.
- A whole-approach redirect, for example a new agent and workflow where the existing path already does the job (request changes and say why).

Do not block on these. Ask for a follow-up ticket instead:

- A refactor of one mechanism that is not a correctness bug, even when the reviewer prefers the other design. Block on the correctness bug, and leave the redesign for a later cleanup.
- Reuse of an existing helper, and simplification.
- Items from the hygiene pass.
- Performance work that is not on a hot path.
- Naming conventions.
- More tests, unless the critical path has only mocked tests.

## What not to comment on

- Format, import order, and lint findings. The tools catch those. A type cast or a hole in type safety is not a lint finding. Ask why it is needed.
- Copy, visual polish, and UX details in the product, unless the user sees nothing on failure.
- Dependency choices.

Do comment on code comments. A useless, long, or AI-written comment gets a request to remove it or clean it up. Refer to `references/hygiene.md`.

Many small PRs get an approval with one line or no text. Do not invent comments to fill a review.

## Post as a pending review

The reviewer finishes every review on GitHub. This skill only adds approved comments as a pending review, which only the reviewer can see. It never submits, approves, or requests changes.

### 1. Show the draft

Show the draft in chat in this format. Number every item, so that the reviewer can refer to it.

```
Reviewed head: <first 10 chars of the head sha>

B. Review body (goes on the pending review; the reviewer sees it in the submit box)
<body text>

C1. <path>:<line> · <tier>
<comment text>

C2. <path>:<start_line>-<line> · <tier>
<comment text>
```

### 2. Apply the reviewer's edits

The reviewer replies with what to keep, drop, or change, for example "keep 1, 2, 5, drop 3, change 4 to '...'". Apply the edits word for word. Show the final list once. Wait for an explicit approval of that final list, such as "post it". An approval of a different list does not count.

### 3. Write the comments file and the body file

Use a private scratch directory outside the repository. Write the approved review body (B) to `<scratch>/body.md`, word for word. If the reviewer dropped B or approved an empty body, write no body file.

Write the approved comments to `<scratch>/comments.json`. Use the line numbers at the reviewed head. Use `"side": "LEFT"` only for a comment on a deleted line. Add `start_line` only for a range in one hunk.

```json
[
  { "id": "C1", "path": "apps/x/src/a.ts", "line": 42, "body": "can we reuse Y here?" },
  { "id": "C2", "path": "apps/x/src/b.ts", "start_line": 10, "line": 14, "body": "..." }
]
```

### 4. Dry run, then post

[`post_pending_review.mjs`](scripts/post_pending_review.mjs) needs Node.js and the `gh` CLI. Run a dry run first. It checks that the PR is open and that its head is still the reviewed commit. It also checks that the reviewer has no pending review on the PR, and that each comment lands on a line in the diff. Set `SKILL_DIR` to this installed skill's absolute directory.

```sh
node "$SKILL_DIR/scripts/post_pending_review.mjs" --repo <owner/name> --pr <N> --commit <reviewed sha> --comments <scratch>/comments.json --body-file <scratch>/body.md --dry-run
```

Leave out `--body-file` only when there is no body file.

- If the script stops, tell the reviewer why, and fix the cause. Do not work around a stop.
- If the head moved, re-check each comment against the new head, and show the reviewer what changed before you post.
- If a comment does not anchor, offer to move it into the review body or to drop it. Use `--skip-unanchored` only after the reviewer agrees.

When the dry run is clean, run the same command without `--dry-run`. Give the reviewer the link to the PR files tab. The review body is already in the submit box, where the reviewer can edit it before submitting.

### Rules

- Post only the final list that the reviewer approved, word for word.
- Post one pending review per PR. Never edit, delete, or submit a pending review.
- Never pass an `event`, and never call the submit endpoint.
- Post as the signed-in `gh` user only.
- To check a posted pending review, read it with GraphQL (`node(id:)` on the review, then `comments { path line startLine }`). The REST comments endpoint shows `null` line numbers for pending comments.
