# Releases

All skills are released together using [release-please](https://github.com/googleapis/release-please-action), its `simple` strategy, and tags such as `v0.1.0`. The manifest and `version.txt` start at `0.0.0` as a bootstrap baseline; no release exists yet. Squash merge this scaffold with a `feat:` PR title to propose the first `0.1.0` release.

## GitHub setup

Repository auto-merge is enabled and squash commits use PR titles. Release-please needs **Allow GitHub Actions to create and approve pull requests** enabled under Settings → Actions → General. GitHub combines those permissions in one setting; the automation does not submit review approvals. The release workflow uses `GITHUB_TOKEN`; no release-token secret is needed.

The branch ruleset protects `main` and `release/**` branches with squash-only pull requests, linear history, deletion and force-push protection, and these required GitHub Actions contexts:

- **CI - gate:** Aggregates successful PR-title and skill validation; a failed or skipped dependency fails the gate.
- **CI - release:** Validates release-please configuration against the upstream schema, verifies version-file consistency, and tests the release automation.

PR-title validation checks only PR titles. Individual commits remain unrestricted. Use squash merging and preserve the validated PR title as the squash commit title. Existing administrator bypass permissions remain in the ruleset.

## Automatic release PRs

The release workflow runs after pushes to `main` or `release/**`, and can be dispatched manually for either. Release-please creates the version/changelog PR for that target branch. The workflow then processes newly generated PRs and existing pending release PRs when retrying a run, verifies the bot author and same-repository release branch, and requires changes to be limited to `CHANGELOG.md`, `version.txt`, and `.release-please-manifest.json`.

These generated release PRs are exempt from the normal PR checks. The workflow records successful exemption statuses for **CI - gate** and **CI - release**, then enables squash auto-merge for the inspected head SHA. No approval or manual merge is required. Unexpected files, conflicts, or other unmet merge requirements fail the automation instead of bypassing protection.

GitHub does not automatically execute normal PR CI or push workflows for these `GITHUB_TOKEN` operations. After confirming the release PR merged, the workflow explicitly dispatches publication on the same target branch. This publishes the version tag and GitHub release without requiring a PAT. See [GitHub's workflow triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

If a release run fails, inspect the error and rerun it after correcting the cause. The script waits up to 60 seconds for the merge; if it remains pending, auto-merge stays enabled and the run fails visibly. If it merges later, manually dispatch **Release please** on its target branch to publish that release.

## PR title conventions

Use Conventional Commit syntax for PR titles. The **CI** workflow runs on PR creation, reopening, title edits, new pushes, and marking a draft ready for review. It checks only the current PR title; individual commit messages are not checked, including single-commit PRs. The action is pinned to a full commit SHA.

| PR title | Meaning | Version change |
| --- | --- | --- |
| `feat(code-review): add review guidance` | New skill or behavior | Minor |
| `fix(code-review): correct severity guidance` | Bug fix | Patch |
| `feat!: change the review output format` | Breaking change; explain migration in the body | Minor before 1.0; major afterward |
| `docs: clarify installation` / `chore: update tooling` | Maintenance | Does not independently trigger a release |

Use `!` in the title to mark a breaking change, and explain the migration in the PR description. Preserve the validated title when squash merging.

## Release workflow

1. Squash merge reviewed PRs into `main` using their validated titles. CI checks the title and skill structure, and the release workflow validates skills again before calling release-please.
2. Release-please opens or updates a release PR with `CHANGELOG.md`, `version.txt`, and `.release-please-manifest.json` changes.
3. The workflow verifies that it is a generated metadata-only release PR, records the check exemptions, and squash merges it automatically.
4. The workflow dispatches a follow-up publication run to create the version tag and GitHub release.
5. Check the release notes and download GitHub's source archive. Install a skill from its `skills/<name>/` folder using the README instructions. The archive includes the license and supporting files.

Do not manually bump the version files or maintain duplicate release notes. Never move a published tag; fix a released issue in a new version. Merging a normal PR with release-worthy changes starts this automatic release cycle; creating this scaffold does not itself publish anything.
