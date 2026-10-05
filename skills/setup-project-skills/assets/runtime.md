# Project runtime

Checked date/revision: <!-- Fill with date and commit; distinguish inspection from execution. -->
Scope: <!-- Apps covered and their repository-relative working directories. -->

## Install and run

Document supported runtime/tool versions and their source, dependency-install
commands, environment-file provisioning (names and sources, never secret values),
services, migration/generation order, start commands, and readiness checks.
Link maintained setup docs and note which commands were actually executed.

For each app, record its URL/port, how to establish checkout/process identity,
port overrides and coupled settings, and how to stop only services started for
this session. Identify shared resources across worktrees and how to obtain an
isolated synthetic environment. Document database ownership checks before seeds,
migrations, or resets; localhost alone does not prove isolation.

## Synthetic data and access

Document fixture/seed entry points, roles and permissions, UI sign-in routes,
account provisioning, and where credentials are obtained securely. Explain
membership, verification, or feature-flag prerequisites. Identify integrations
that can be simulated locally and those that remain blocked. Do not include
passwords, tokens, cookies, or session files.

## Validation and browser tooling

Link required checks and provide commands with their working directory and scope.
Record browser-tool availability or the installed Playwright package/workspace,
browser provisioning command, supported viewports, and artifact location rules.
Separate required gates from optional checks and evidence capture.

## Verification and unknowns

Record successful checks, observed readiness/sign-in, unexecuted steps, blockers,
and how to resolve remaining unknowns. Link the source for operational facts.
