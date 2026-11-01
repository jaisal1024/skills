# Hygiene pass

Do this pass on every PR, after the architecture pass. Read each changed hunk again and look only for these items. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

Give each item the nit tier, or non-blocking when it changes behavior. Keep each comment to one line, and start a true nit with "nit:". Put hygiene items inline only, never in the review body.

## No hard-coded values that should vary

Read config through the repository's config layer, with a default. Do not hard-code an organization or a customer name in logic. Use the identifier that the data already carries. A short-term hard-code is fine when the author says it is temporary.

## Code comments earn their place

Ask to remove a comment that restates the code or adds nothing. Ask to shorten a long or hard-to-read comment. Ask for a short comment when the code needs a reason that nobody can see from the code.

## Do not build for a future that is not decided

An enum with one value, a second API for a case that one flag covers, or a layer for a provider that may never come: ask to remove it and add it back when the case lands.

## Question needless looseness

An optional parameter that every caller passes, an async function with no await, or a null where undefined works: ask why.

## Prefer an includes list to chained equality

A chain of `x === a || x === b || x === c` reads better as a list and `includes`.

## Use the repository's idioms and helpers

Use the same ID, timeout, and error helpers as the code around the change. Do not catch an error only to log it and throw it again. Follow the existing styling pattern.

## Ask why a cast is needed

A type cast hides a type problem. Ask why it is needed.

## Flag dead code and dead steps

Point out a route, file, or export that nothing calls. Point out a build or setup step that the change makes unnecessary. Say when you are not sure.

## Put files where the repository puts them

Tests go in the test folder the repository uses. A shared script or helper goes where the other shared ones are. Refer to "New code follows its sibling code" in `backend.md`.
