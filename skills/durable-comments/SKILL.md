---
name: durable-comments
description: Apply a durable source-comment style to code comments and JSDoc. Use when adding, editing, or reviewing source comments, not ordinary documentation or user-facing prose.
---

# Durable comments

Prefer no comment when names, types, and control flow already explain the code.
A useful comment preserves information the code cannot express: a reason,
constraint, invariant, tradeoff, or non-obvious consequence.

## Write durable context

- Explain why this implementation or boundary is necessary, not what the next
  statement does.
- State the consequence of violating a constraint. Do not write unexplained
  warnings such as `important` or `do not change`.
- Keep local invariants beside the code. Put cross-cutting architectural
  decisions in the project's design docs and leave a short local explanation or
  link.
- For a workaround, name the external cause and the condition that permits its
  removal.
- Keep links supplementary. The comment must remain useful when its ticket or
  external page is unavailable.
- Use JSDoc only for semantics the signature cannot express, such as units,
  side effects, security boundaries, failure behavior, or unusual contracts.
- Give narrow suppression directives a concrete reason.

## Remove non-durable commentary

- Do not narrate obvious operations, restate names or types, or describe each
  step of a test.
- Do not leave editing-session residue: `as requested`, `we now`, `this change`,
  `previously`, `the user`, `Claude`, `the agent`, or explanations addressed to
  a reviewer. Change history belongs in commits and pull requests.
- Delete commented-out code. Git preserves it.
- Do not preserve a stale comment after the code or constraint changes.

## Examples

```ts
// Keep the token out of logs because possession grants timeline access.
auditTimelineAccess({ actorId });

// Distance is meters because PostGIS geography functions use SI units.
const radius = miles * METERS_PER_MILE;
```

Avoid:

```ts
// Create the audit event.
auditTimelineAccess({ actorId });

// We now avoid logging the token as requested by the user.
auditTimelineAccess({ actorId });
```

## Enforce comment length in Claude Code

The optional [comment-limit hook](scripts/comment-limit.mjs) flags long comments
as Claude Code writes them. See [the hook reference](references/claude-hook.md)
to install it.
