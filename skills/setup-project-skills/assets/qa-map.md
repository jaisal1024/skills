# QA feature map

Checked date/revision: <!-- Fill with date and commit. -->
Discovery scope: <!-- Apps, source areas, roles, and docs actually inspected. -->

## Feature inventory

Use a row per meaningful feature, adding details below where needed.

| Feature | Entry point | Roles/flags | Actions and significant states | Data/integrations | Source | Discovery status |
| --- | --- | --- | --- | --- | --- | --- |

Statuses: code-discovered, runtime-observed, blocked, deprecated. Discovery
status does not imply a QA pass; track execution separately below. Include
deep-linked/admin features and permission-denied, empty, loading, error, and
responsive states where relevant to the feature.

## QA journeys

For each journey document the role, prerequisites and synthetic fixtures,
entry point, actions, visible expected outcomes, relevant viewport, and cleanup.
Include cross-feature journeys where a route-by-route pass misses behavior.
Identify the smallest useful smoke pass and additional risk-driven journeys.

## Execution evidence

Record journey, date/revision, role/environment, observed outcome, artifact
path/link, defects, and untested states. Use passed, failed, blocked, or not-run;
never promote a code-discovered feature to passed without exercising it.

## Discovery gaps

List uninspected apps, roles, flags, integrations, and unknown behavior, with
the next source or runtime check needed. Do not label a partial inventory as
all features.
