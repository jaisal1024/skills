# Releases

All skills are released together using [release-please](https://github.com/googleapis/release-please-action), its `simple` strategy, and tags such as `v0.1.0`. The manifest and `version.txt` start at `0.0.0` as a bootstrap baseline; no release exists yet. Squash merge this scaffold with a `feat:` PR title to propose the first `0.1.0` release.

## GitHub setup

Repository auto-merge is enabled and squash commits use PR titles. Release-please authenticates as a dedicated private GitHub App. The workflow uses `GITHUB_TOKEN` only for verified release-PR check exemptions, auto-merge, and publication dispatch; it does not create release PRs or version tags. The combined Actions setting for creating PRs and approving reviews can remain disabled.

The branch ruleset protects `main` and `release/**` branches with squash-only pull requests, linear history, deletion and force-push protection, and these required GitHub Actions contexts:

- **CI - gate:** Aggregates successful PR-title and skill validation; a failed or skipped dependency fails the gate.
- **CI - release:** Validates release-please configuration against the upstream schema, verifies version-file consistency, and tests the release automation.

PR-title validation checks only PR titles. Individual commits remain unrestricted. Use squash merging and preserve the validated PR title as the squash commit title. Existing administrator bypass permissions remain in the ruleset.

## Release app and immutable tags

[Register the dedicated release app](https://github.com/settings/apps/new?name=jaisal1024-skills-release&description=Release-please+for+jaisal1024%2Fskills&url=https%3A%2F%2Fgithub.com%2Fjaisal1024%2Fskills&public=false&webhook_active=false&contents=write&issues=write&pull_requests=write) using the prefilled private app configuration. Webhooks and user authorization are unnecessary. Grant only **Contents**, **Issues**, and **Pull requests** read/write permissions (Metadata read is automatic), then install the app on **jaisal1024/skills only**.

1. Add its Client ID as the repository Actions variable `RELEASE_APP_CLIENT_ID`.
2. Generate a private key in the app settings and add the PEM directly as the Actions secret `RELEASE_APP_PRIVATE_KEY`. Do not commit it or paste it into a PR or chat.
3. Add the app as the sole **Integration** bypass actor, with **Always** bypass mode, to the **Release app version tag creation** ruleset. The API actor ID is the numeric **App ID**, not the Client ID or installation ID.
4. Keep **Immutable release version tags** without bypass actors. This separate ruleset restricts both updates and deletion, so even the release app cannot rewrite or delete version tags.

Both tag rulesets target `refs/tags/v*`, covering the configured `vMAJOR.MINOR.PATCH` tags and prereleases. Creation is blocked for everyone until the dedicated app is added. GitHub Actions and administrators have no tag bypass. A repository administrator can still edit the rulesets themselves; protection does not remove repository administration rights.

GitHub rulesets authorize app identities, not workflow files. Keep this app's private key exclusive to the release workflow and review changes to that workflow. Anyone who obtains the app credentials can act as the release app. The app has no Administration permission and cannot change these rulesets. See [GitHub ruleset rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets).

## Automatic release PRs

The release workflow runs after pushes to `main` or `release/**`, and can be dispatched manually for either. Release-please creates the version/changelog PR for that target branch. The workflow then processes newly generated PRs and existing pending release PRs when retrying a run, verifies the bot author and same-repository release branch, and requires changes to be limited to `CHANGELOG.md`, `version.txt`, and `.release-please-manifest.json`.

These generated release PRs are exempt from the normal PR checks. The workflow records successful exemption statuses for **CI - gate** and **CI - release**, then enables squash auto-merge for the inspected head SHA. No approval or manual merge is required. Unexpected files, conflicts, or other unmet merge requirements fail the automation instead of bypassing protection.

App-created PRs can trigger normal PR CI. The merge uses `GITHUB_TOKEN`, which does not automatically trigger the push workflow. After confirming the release PR merged, the workflow explicitly dispatches publication on the same target branch. Release-please then publishes the version tag and GitHub release using its app token. See [GitHub's workflow triggering rules](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

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
