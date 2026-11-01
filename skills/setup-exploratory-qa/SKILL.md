---
name: setup-exploratory-qa
description: Set up exploratory-qa for a codebase by writing project-specific QA scripts, such as starting the app and signing in a synthetic account, and a QA feature map built with the user. Use when setting up exploratory-qa for a project, or when its scripts or feature map are stale.
---

# Set up exploratory QA

This skill writes two things for `exploratory-qa`, and nothing else:

- scripts in `.agents/project-context/qa-scripts/` that do the repository-specific steps of
  a QA pass;
- a feature map in `.agents/project-context/qa-map.md`.

Put them at the repository root, not in the installed skill folder, so that a skill update
does not replace them. Do not edit installed skills.

## Read the repository

Read the applicable `AGENTS.md`, setup and testing docs, manifests, dev scripts, seed and
fixture files, and the browser test setup. In a monorepo, find the app and its working
directory; do not assume that the Git root runs it. Read any existing `qa-scripts/` and
`qa-map.md` first, and keep what is still correct.

This setup does not authorize provisioning paid services, resetting databases, changing
repository policy, or publishing evidence. Never write secret values, session state, or
personal data into a script or the map.

## Write the scripts

Write a script only for a step that the repository does not already do with one command. When
a repository script exists, call it; do not copy its logic. Typical scripts:

- `start.sh`: start the app for this checkout with the supported workflow, or reuse a server
  that belongs to this checkout. Wait until the intended page loads, then print its URL. Do
  not stop another worktree's server, and do not reset, migrate, or seed data of unknown
  ownership.
- `sign-in.sh <role> <state-file> [origin]`: sign in a synthetic account through the real UI
  with the repository's installed Playwright. Confirm the identity and role on the page, then
  save the storage state with owner-only permissions. Refuse a non-local origin and an
  existing state file. Take credentials from the repository's seed or fixture files, or from
  an environment variable; never hard-code a real credential.

Add another script only for a step that a QA pass repeats and that is specific to this
repository, such as creating a state that no seed provides. Each script:

- starts with a comment that says what it does, its arguments, and what it refuses;
- uses the repository's pinned tools and never installs an unpinned dependency;
- exits non-zero with a clear message on failure;
- runs from any directory.

Run each script when the environment is available, and fix it until it works. A script you
could not run is unverified; say so in its header comment and in the report.

## Build the feature map with the user

Ask the user which features to cover, which roles use them, and which journeys matter most.
Do not build the feature list from code: routes, flags, and components show where a feature
lives, not which features exist, which are live, or which matter. Use code only to find the
entry point, roles, and source path of a feature the user named, and to ask about a surface
the user did not mention. Record the user's answer, not your inference.

Use [qa-map.md](assets/qa-map.md) as the template. Write concrete journeys with visible
expected outcomes, and list what remains unknown as open questions for the user.

## Hand off

Report the scripts and their verification, the feature map, and the open questions. Leave the
files for review unless committing was already authorized.
