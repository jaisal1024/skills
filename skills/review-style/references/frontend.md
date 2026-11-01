# Frontend and client/server state

Read this for components, hooks, client state, and any client code that copies a server rule. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## The server decides, the client renders

When the client re-derives a rule or a gate that the server already computes, ask the server to return the result. Several near-identical client branches usually mean a missing server field.

## A failure the user can see

When a request fails and the code only logs, the user sees nothing. Ask to show an error message.

## Fix it at the shared level

For a layout or behavior bug in one screen, ask whether a fix at a higher level fixes it for every screen.

## Use the repository's patterns for client state

Use a mutation hook instead of `void` plus manual state. Reuse the hook that already exists for the same resource. Ask why a new piece of state is necessary.

## Version skew

The client and the server deploy at different times. Refer to `rollout.md`.

## Visual evidence

For a visual change, ask for an exploratory QA pass with screenshots.
