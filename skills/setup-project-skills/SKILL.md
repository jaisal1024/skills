---
name: setup-project-skills
description: Configure installed address-feedback and exploratory-qa skills for a codebase by documenting its runtime, QA feature map, and review conventions. Use when setting up these skills for a project or refreshing stale project context.
---

# Set up project skills

Keep reusable skill instructions separate from codebase knowledge. Store shared
project context at the repository root in `.agents/project-context/`, regardless
of whether skills are installed in `.agents/skills`, `.claude/skills`, or
`.cursor/skills`. These Markdown files are documentation, not executable hooks
or a new configuration system. Do not edit installed skills to embed project facts.

## Establish scope and discover facts

Locate the target repository and read its applicable `AGENTS.md`, existing setup
and testing docs, manifests, CI, and dev scripts. Reuse existing documentation
with links instead of copying long instructions. In a monorepo, identify the
relevant apps and their working directories; do not assume the Git root runs them.

Inspect existing project context before writing. Preserve maintained facts and
user edits, and update only the requested apps or sections. Initial setup can
inspect code without running the app; label runtime checks as unverified until
executed. Setting up skill documentation does not authorize provisioning paid
services, changing repository policies, resetting databases, or publishing evidence.

Infer routine details from the repository. Ask only for consequential missing
facts such as the intended test environment or an unavailable account-provisioning
method. Continue documenting independent sections while answers are pending.
Never copy secret values, session state, or personal data into these files.

## Write only useful context

Use these templates as starting structures, adjusting them to the project:

- [runtime.md](assets/runtime.md) → `.agents/project-context/runtime.md`: app
  directories, supported runtime, install/start commands, local resource ownership,
  readiness, synthetic data, authentication, and change-specific checks.
- [qa-map.md](assets/qa-map.md) → `.agents/project-context/qa-map.md`: an inventory
  of features, roles, states, prerequisites, and concrete QA journeys.
- [feedback.md](assets/feedback.md) → `.agents/project-context/feedback.md`: review
  target discovery, useful validation conventions, and permitted evidence locations.

Create only files needed by the installed skills. `runtime.md` serves both skills;
`qa-map.md` serves exploratory QA; `feedback.md` is optional when repository
instructions already cover review conventions. Resolve template prompts into
facts or explicit unknowns with a next discovery step. Do not leave generic
placeholder text masquerading as a completed setup.

For the feature map, inspect routes/screens, navigation, role and permission
definitions, feature flags, tests, and product documentation. Trace main entry
points into user actions and important states, including features absent from
navigation. Group related routes into features; a route list alone is not a QA
plan. Record source paths and distinguish code-discovered, runtime-observed,
blocked, and deprecated features. Do not claim exhaustive coverage from one
role, route scan, or successful home-page load. Bound discovery to the requested
apps, list the areas inspected, and state what remains undiscovered.

## Verify and hand off

Check documented commands and paths against the current checkout. When runtime
verification is in scope and the environment is available, start the app using
its supported workflow, verify the server belongs to this checkout, and exercise
a representative synthetic account and journey. Record what actually ran and
any blockers; an inferred command is not a verified setup.

Give each file the checked revision/date and links to its evidence. Project
context is advisory: current source, applicable repository instructions, and
the user's direction govern when they disagree. Update stale facts narrowly as
they are discovered rather than requiring a full setup before every task.

Report created or updated files, verification, consequential unknowns, and the
next ready-to-run QA journeys. Leave files for review unless committing or
publishing was already authorized.
