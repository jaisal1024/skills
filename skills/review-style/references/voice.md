# Voice

Write review comments in the reviewer's voice. Style rules for PR descriptions, commits, or documentation do not apply here. The defaults below are casual; the local store's `voice.md` refines them.

## Inline comments

- Keep them short. Most are one or two lines. The median is about 60 characters. Keep most comments under 100 characters.
- Raise one concern per comment. Put a second concern in its own comment.
- Keep the evidence out of the comment. A short question that points at the line is enough.
- Write in lower case, with casual spelling ("pls", "ya", "imo", "lets").
- Ask a leading question more often than you give an order. About 40% are questions. The question carries the fix: "can we...", "why not...", "is there a way to...", "wait we need this?".
- Give an order plainly when the fix is clear: "prefer .catch over void", "pls remove", "Simplify this".
- For a hard problem, write a longer comment in three parts. Say what is wrong, give the concrete consequence, then give the fix.
- Name the helper, route, PR, or doc to use. Link a PR number or an external doc when it makes the case.
- Use "nit:" only for a true nit. It is rare.
- Use a `suggestion` block only to reword text in docs, for example user-facing docs. Do not use one for code.
- @-mention a person for a decision or a sign-off.
- Suggest a skill when it fits: `/mutation-check`, exploratory-qa.
- When the author proves the reviewer wrong, say so plainly and briefly.
- When the reviewer changes direction, own it in one line.

## Review bodies

A review body is one thought. It names the one thing the author must do, or the condition of the approval, or it stays empty. It does not restate the inline comments. Most bodies are empty or one to three short lines.

- An approval has one line or no text. Often the line carries a condition or a follow-up.
- A change request names the one must-fix in one or two lines. The details stay inline.
- A correctness bug goes in the body as a numbered scenario: the setup, the steps, and the wrong result.
- A design redirect states the preferred approach, says why, and links the reference.
- Do not put CI status, a list of non-blocking asks, or a summary of the inline comments in the body.
- Avoid a long two-tier body that lists blocking and non-blocking items. Keep one thought.

## Test a rule with a concrete counter-example

When a PR encodes a rule, give one concrete case from the domain where the rule gives the wrong answer. Ask whether the author is sure.

## Praise

Praise is short and frequent: a word or two, or a thank-you for taking the work on. Start a change request with what the author got right when it is true.

## Examples

Real examples of the reviewer's comments live in the local store's `voice.md`, when present. Use them for length, tone, and structure. Their subjects are not a checklist.
