# Releases

All skills are released together using [release-please](https://github.com/googleapis/release-please-action), its `simple` strategy, and tags such as `v0.1.0`. The manifest and `version.txt` start at `0.0.0` as a bootstrap baseline; no release exists yet. Squash merge this scaffold with a `feat:` PR title to propose the first `0.1.0` release.

## GitHub setup

Enable GitHub Actions and enable **Allow GitHub Actions to create and approve pull requests** under Settings → Actions → General. The workflow uses the repository's built-in `GITHUB_TOKEN`; no extra secret is needed for basic releases.

Under Settings → General → Pull Requests, enable squash merging and choose **Pull request title** as the default squash commit title. Use squash merging so the validated PR title becomes the commit message release-please reads on `main`. Make **Validate PR title** a required status check in the branch rules to enforce the title format before merging.

The release and skill validation workflows target `main`. If the default branch changes, update their branch filters and the release-please target branch.

GitHub does not automatically trigger other workflows for PRs or tags created using `GITHUB_TOKEN`. Before merging a release PR, run the **Validate skills** workflow manually with that PR's head branch selected and confirm it succeeds. If branch protection requires automatic PR checks, including **Validate PR title**, configure a suitably scoped GitHub App token or a `RELEASE_PLEASE_TOKEN` secret; the release workflow prefers that secret when present. See the [upstream token guidance](https://github.com/googleapis/release-please-action#other-actions-on-release-please-prs).

## PR title conventions

Use Conventional Commit syntax for PR titles. The **Validate PR title** workflow runs on PR creation, reopening, title edits, new pushes, and marking a draft ready for review. It checks only the current PR title; individual commit messages are not checked, including single-commit PRs. The action is pinned to a full commit SHA.

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
3. Review the proposed version, notes, and accumulated changes. Try changed skills on representative tasks and validate the release PR as described above.
4. Merge the release PR when ready. The next release workflow run creates the version tag and publishes the GitHub release.
5. Check the release notes and download GitHub's source archive. Install a skill from its `skills/<name>/` folder using the README instructions. The archive includes the license and supporting files.

Do not manually bump the version files or maintain duplicate release notes. Never move a published tag; fix a released issue in a new version. Release publication is the consequence of merging the release PR; creating this scaffold does not itself publish anything.
