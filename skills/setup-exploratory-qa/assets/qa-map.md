# QA feature map

Checked date/revision: <!-- Fill with date and commit. -->
Confirmed with: <!-- Who answered the feature questions, and when. -->

## Features

Add a row for each feature the user named. Find the entry point, roles, and source in the
code; take the feature itself from the user.

| Feature | Entry point | Roles/flags | Actions and significant states | Data/integrations | Source | Status |
| --- | --- | --- | --- | --- | --- | --- |

Statuses: user-confirmed, runtime-observed, blocked, deprecated. Status does not imply a QA
pass; track execution separately below. Include permission-denied, empty, loading, error, and
responsive states where they matter to the feature.

## QA journeys

For each journey, write the role, the synthetic fixtures, the entry point, the actions, the
visible expected outcome, the viewport, and cleanup. Name the script in
`.agents/project-context/qa-scripts/` that starts the app or signs in the role. Mark the
smallest useful smoke pass.

## Execution evidence

Record journey, date/revision, role, observed outcome, artifact path or link, defects, and
untested states. Use passed, failed, blocked, or not-run.

## Open questions

List what the user has not confirmed: features, roles, journeys, or surfaces found in the
code that the user did not mention. Ask; do not guess.
