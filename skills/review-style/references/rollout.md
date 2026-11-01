# Rollout and version skew

Read this for every PR that changes behavior for existing users, clients, or stored data. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## Old clients and the server deploy at different times

A client from the last release still runs against the new server. Make sure the change works across releases in both directions.

## Trace the old client and the in-flight data

Name the concrete cases. Trace what an old client tab does against the new server. Find the records created before the deploy, and find who resumes them.

## Put new blocking behavior behind a gate

When a change can strand old clients or in-flight records, ask for a gate. This is blocking.

## Turn a flag on for everyone before you remove it

Flip the flag on for every client in production first. Watch for regressions. Remove the flag in a later PR.

## Do not release on an open decision

When a design choice is still open, hold the release until it is made. A known gap that a future case will hit gets a ticket and a TODO that names the ticket.

## Check that removed code has no live user

Before a check, an option, or a handler goes away, make sure nothing still depends on it.

## Ship the producer change before you remove the consumer

Stop creating the work in one release. Remove the handler in a later release.

## Add new paths next to old ones

Do not change an old handler or setting in place. Add the new one next to it, then swap.

## Ask for a cleanup ticket

After a rollout, ask for a ticket to remove the old index, task, or table. When code stays but nothing uses it, ask to mark it deprecated.

## A new route runs the same guards as its sibling routes

When a new route does what other routes already do, it calls the same guards: the kill switch, the pause check, and the ownership check. Do not move a guard into shared code if that blocks other paths with no way to resume.
