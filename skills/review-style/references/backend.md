# Backend and API contracts

Read this for API routes, request and response schemas, error handling, and caches. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## New code follows its sibling code

Compare new code with how the same repository already does the same thing. A new app or service copies the layout of its sibling apps: where plugins, routes, config, and tests live. Read config through the repository's config layer with a default, not a hard-coded value. Use the same shared helpers. Remove build or setup steps that the new code makes unnecessary.

## Add to an existing resource before you add an RPC endpoint

Prefer a REST sub-resource on an existing resource to a new RPC-style endpoint.

## A request field must not decide a server rule

Keep the rule on the server, behind a setting or a server function. The client sends input, not decisions. When the repository has a validated endpoint wrapper, use it.

## A best-effort side effect must not fail the request

When a side effect such as a notification or an audit write is not part of the contract, catch and report its failure. Do not fail the request.

## Never return a success with no value

On a timeout or a missing result, log an error, emit a metric, and return an explicit failure such as a 409.

## Throw instead of a silent fallback

A function that does not throw follows the repository's naming for that, and returns `[data, error]` so the caller gets the error object.

## Do not make a core dependency silently optional

Code that relies on the dependency, such as de-dupe, then fails in a way nobody sees.

## Pass loaded data in, do not fetch it again

Flag N+1 calls. Pass the object the caller already has into the function.

## Fetch only what you need

Use metadata or a HEAD request instead of a full download. Ask whether two network calls can be one.

## Move slow side effects off the request path

A handler with many awaited side effects belongs on the task queue.

## Check downstream consumers when a payload changes

When a payload gains new keys, ask whether a strict parser or an alarm downstream rejects unknown keys.

## Use the actor that scopes the read

A read that serves one user or one organization runs with that actor, so the query carries the scope. Ask for the scoped variant instead of an admin read.

## Default to the safe direction

When a list decides behavior, make the safe case the default and opt the exceptions in. A list that every record must join to keep working breaks the day someone forgets to add one.

## Internal resources stay private

A channel, key, or endpoint that only the backend uses must not be reachable by a user.

## Every log and metric earns its cost

Ask what each new log and metric is for. A failure state gets a custom metric, even when it already logs an error or sends a Slack alert. Refer to "Never return a success with no value" above. Match the alert level to the impact: do not page on-call for a state that needs no action. Cut a routine log or metric that nobody will chart, alert on, or read. A metric or outcome name says what happened.

## Tell on-call what to do

Ask for alerts on error rates. Ask for a log line that tells on-call what to do.
