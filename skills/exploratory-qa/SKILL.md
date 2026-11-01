---
name: exploratory-qa
description: Explore a running app, verify user flows and visual states, and capture screenshots or recordings for QA or PR evidence. Use when asked for manual exploratory QA or to QA a branch or PR, or when a reviewer asks what a change looks like. Not for authoring automated tests or repackaging failed-test artifacts.
---

# Exploratory QA

Select features, roles, states, and viewports from the user's request and current
diff. For broader QA, use the project's feature map to plan journeys and identify
coverage gaps. Use synthetic test data and exercise the real UI. This pass does
not replace required automated checks.

Document what the app does now, not the old state; the diff already says what
changed. The exception is a fix to a visible defect, where a before/after pair is
the evidence. Screenshots are the default. Record only a flow, transition, or
animation that a still frame cannot show.

## Load project context

Read applicable repository instructions. At the repository root, regardless of
where this skill is installed, use the scripts in `.agents/project-context/qa-scripts/`
to start the app and sign in, and read `.agents/project-context/qa-map.md` for
the features and journeys, when present. Read a script before you run it, and
check it against the current checkout. If they are absent, inspect setup docs,
manifests, dev scripts, and fixtures to learn enough for the requested pass. Do
not block focused QA on a feature map. To write the scripts or the map, use
`setup-exploratory-qa` if installed. Keep discovered features distinct from
tested ones.

## Reach the intended app

Use the project's supported install, migration, seed, and startup workflow, in
the correct app/workspace directory. Check for an existing server and verify
its process or build belongs to the intended checkout before using it as evidence.
A responding port, login redirect, or lock file is not branch identity. Do not
kill another worktree's server. Account for coupled URL/auth settings when
changing ports.

Verify local service and database ownership before running migrations or seeds;
localhost may be a tunnel and worktrees may share resources. Use disposable
synthetic resources for destructive setup. Do not reset unknown data, stamp
migration ledgers, bypass auth, or switch to production to obtain working data.
Report missing prerequisites as blocked coverage.

Keep services in a managed terminal and verify readiness by loading the intended
page. Use the documented synthetic account provisioning and real UI sign-in.
Confirm the final route and visible identity/role before testing; preserve
membership, verification, and permission checks.

## Plan the pass

Read the diff and list each state the change affects, at each viewport and theme
it touches. Default to one desktop viewport; add a device only for a responsive
change and a dark scheme only for a theme change.

A diff names components, not routes. Search for where each component renders and
which data makes it render. Prefer synthetic accounts or fixtures that already
show the state; otherwise create it through the app's own UI. List any state you
cannot reach as not reached rather than faking it.

## Explore and capture

Use available browser tools, `playwright-cli`, or a temporary script with the
project's installed Playwright dependency. Do not assume a particular package
manager, login route, role list, or port. Follow project tooling for browser
installation; do not add an unpinned library merely for this pass.

Keep auth state and artifacts outside the repository in a private directory:

```sh
QA_DIR=$(mktemp -d "${TMPDIR:-/tmp}/exploratory-qa.XXXXXX")
```

Never commit or upload session state, cookies, credentials, private capability
URLs, or real user data. Prefer interactive sign-in; any temporary sign-in script
must use the project's selectors and verify identity before saving private state.

Choose concrete journeys with visible expected outcomes. Exercise affected
actions and relevant empty, loading, error, permission, and responsive states.
For broad QA, record what remains untested instead of implying comprehensive
coverage.

With `playwright-cli`, give the session a name unique to this pass, such as the
PR number, so a parallel pass does not take over your browser:

```sh
QA_SESSION=qa-123
pw() { npx playwright-cli -s="$QA_SESSION" "$@"; }
pw open
pw resize 1280 800
pw state-load "$QA_DIR/auth.json"
pw goto "$QA_URL/some/route"
pw snapshot                                    # refs for each control
pw click e14
pw screenshot --filename "$QA_DIR/drawer-closed.png"
pw console error                               # errors since load
pw close
```

A snapshot right after navigation can show the page before its data loads; take
it again before acting on an empty or loading state. If a tour or prompt outside
the change blocks a click, dismiss it and say so in the report. Read console and
network errors: a page can look correct while its data request fails. Separate
errors caused by missing local services from defects of the change.

For a state that a URL alone reaches, the optional
[capture helper](scripts/capture.sh) takes a page or element PNG using
`@playwright/test` or `playwright` from the current workspace. Set
`PLAYWRIGHT_DIR` for a different dependency workspace, and `QA_URL` to the verified
app URL. Set `SKILL_DIR` to this installed skill's absolute directory:

```sh
"$SKILL_DIR/scripts/capture.sh" "$QA_URL/some/route" "$QA_DIR/list.png" --storage-state "$QA_DIR/auth.json"
"$SKILL_DIR/scripts/capture.sh" "$QA_URL/some/route" "$QA_DIR/mobile.png" --device "iPhone 15 Pro"
"$SKILL_DIR/scripts/capture.sh" "$QA_URL/some/route" "$QA_DIR/card.png" --element "[data-testid=card]"
```

Omit storage state for public pages; include it in each command needing auth.
The helper supports viewport, color scheme, wait, timeout, and full-page capture.
Prefer an element crop when the change is one component: the reviewer sees the
behavior without hunting for it. For a crop, the helper grows the viewport until
a tall element fits and hides sticky or fixed layers that cover it.

A snapshot or fixed delay is not proof of hydration or a successful flow. For
async states, assert visible readiness before capturing. Name each file after the
state it shows. Read back every image and check for wrong routes or roles,
loading or error pages, the sign-in page, clipping, and sensitive content before
using it as evidence.

Record only when motion or multiple steps matter; follow
[the recording guide](references/recording.md) to record, review, and size a
video, and convert it to a widely playable MP4 with
[`to-mp4.sh`](scripts/to-mp4.sh).

## Report and share

A defect is a valid QA outcome. Report route, role, reproducible steps, expected
and actual behavior, evidence, and coverage gaps. Fix defects only within the
user's existing scope; a QA-only task does not silently expand into fixes. When
maintaining a feature map, record date/revision and actual journey outcomes,
separately from discovery status. Do not publish a clean result that omits defects.

Hand back the reviewed files with one caption line each
(`<surface> · <state>`, plus viewport and theme when not the desktop default),
the states not reached and why, and any defects. A background subagent stops
here; the agent that started it shares evidence after the user approves.

Default to reviewed local artifacts and a concise report. Upload evidence or edit
a PR only when authorized, using an available supported connector, CLI, or UI.
Confirm the destination and access expectations; repository privacy alone does
not establish attachment privacy. If sharing is unavailable, retain local
evidence instead of falling back to a public host.

Preserve an existing PR body and add labeled evidence to its validation section;
use a temporary body file for multiline edits. Read back external edits to verify
the evidence appears once. Replies and reviewer/bot reruns require their own
authorization. Remove temporary auth state when no longer needed. Report tested
journeys, defects, reviewed artifacts, and untested or blocked states.
