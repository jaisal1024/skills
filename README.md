# Skills

Personal, reusable Agent Skills for Codex, Claude Code, and Cursor: instructions that capture how I want recurring work done. This repository is where I develop, review, and release them.

## Skills

| Skill | Purpose | Status |
| --- | --- | --- |
| [code-review](skills/code-review/SKILL.md) | Reserved for the future code-review workflow. | Placeholder; no review instructions yet. |
| [setup-project-skills](skills/setup-project-skills/SKILL.md) | Document a codebase's runtime, QA features, and review conventions for installed skills. | Ready. |
| [address-feedback](skills/address-feedback/SKILL.md) | Investigate and fix actionable PR or merge-request feedback. | Ready. |
| [exploratory-qa](skills/exploratory-qa/SKILL.md) | Explore app flows and visual states, capture evidence, and report defects and coverage. | Ready. |

## Use a skill

Install directly from GitHub with [the Skills CLI](https://github.com/vercel-labs/skills). Requires Node.js and npm; no npm package publication or directory registration is needed for this repository.

[![Install for Codex](https://img.shields.io/badge/Install_for-Codex-111827?style=for-the-badge)](#codex)
[![Install for Claude Code](https://img.shields.io/badge/Install_for-Claude_Code-D97757?style=for-the-badge)](#claude-code)
[![Install for Cursor](https://img.shields.io/badge/Install_for-Cursor-2563EB?style=for-the-badge)](#cursor)
[![Ask your agent](https://img.shields.io/badge/Ask_your_agent-to_install-15803D?style=for-the-badge)](#ask-your-agent-to-install)

Click a button to open its instructions, then copy the command into your terminal or the prompt into your agent. README buttons do not execute commands. The `code-review` skill is currently a placeholder; installing it does not provide a working review workflow yet.

Run installation commands from the project where you want the skill available. Check existing local skill changes before installing. The examples select one skill and agent explicitly and skip installation prompts.

### Codex

```sh
npx -y skills add jaisal1024/skills --skill code-review --agent codex --yes
```

Once the skill has instructions, invoke it with `$code-review`.

### Claude Code

```sh
npx -y skills add jaisal1024/skills --skill code-review --agent claude-code --yes
```

Once the skill has instructions, invoke it with `/code-review`.

### Cursor

```sh
npx -y skills add jaisal1024/skills --skill code-review --agent cursor --yes
```

Once the skill has instructions, ask Cursor to use the `code-review` skill.

### Ask your agent to install

Copy this prompt into Codex, Claude Code, or Cursor:

```text
Install the code-review skill from jaisal1024/skills into the current project
for the agent I am using. Check for existing local skill changes first and
preserve them. Use the Skills CLI with --skill code-review and the matching
--agent value (codex, claude-code, or cursor). After installation, confirm
that the agent's skill directory contains a readable SKILL.md. This skill
is currently a placeholder; report that limitation.
```

### Discover, share, and update

```sh
# List available skills without installing
npx -y skills add jaisal1024/skills --list

# Check for updates to installed skills
npx -y skills check

# Update installed skills
npx -y skills update
```

Add `--global` to an installation command to make the skill available across projects for that agent. Replace `code-review` with another skill name as this catalog grows. Share this README or the appropriate installation command with users; private repositories require their own GitHub access. Review local changes before updating installed skills.

### Manual installation

Skills use the shared `SKILL.md` format. You can also copy a skill's entire folder from `skills/` into a supported location, keeping the folder directly under the skills directory. Check existing local changes before replacing a skill. Include the license when sharing copies.

| Agent | Project installation | Personal installation |
| --- | --- | --- |
| Codex | `.agents/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` |
| Claude Code | `.claude/skills/<skill-name>/` | `~/.claude/skills/<skill-name>/` |
| Cursor | `.agents/skills/<skill-name>/` or `.cursor/skills/<skill-name>/` | `~/.agents/skills/<skill-name>/` or `~/.cursor/skills/<skill-name>/` |

For example, copying `skills/code-review/` into a target project's `.agents/skills/` makes that folder available to Codex and Cursor. Claude Code uses its `.claude/skills/` location. The code-review skill is currently only a placeholder.

Once a skill has instructions, invoke it by name: `$code-review` in Codex, or `/code-review` in Claude Code and Cursor. Natural-language requests can also select a skill through its description.

The shared instructions live in `SKILL.md`. Optional `agents/openai.yaml` metadata is specific to Codex; keep the actual workflow independent of it. Add scripts, references, or assets only when needed.

### Configure a codebase

Install `setup-project-skills` alongside the skills you want to use. In the
target codebase, ask an agent:

```text
Use $setup-project-skills to configure address-feedback and exploratory-qa for
this repository. Discover the supported app startup, synthetic test accounts,
validation commands, and user features. Document QA journeys and distinguish
code-discovered features from behavior actually verified in the app.
```

The setup produces shared Markdown documentation at the target repository root:

```text
.agents/project-context/
  runtime.md    # App setup, ownership, synthetic access, and validation
  qa-map.md     # Feature inventory, journeys, evidence, and discovery gaps
  feedback.md   # Optional review-host and project-specific review conventions
```

This location stays the same for Codex, Claude Code, and Cursor installations.
Keep these files in the codebase and version them when appropriate; they contain
project knowledge, not secrets. Keeping them outside installed skill folders
preserves customization when replacing skills with newer versions. Existing
project docs remain authoritative and can be linked instead of duplicated.

Setup is optional for a focused task: each skill can discover the details it
needs directly. Setup makes that discovery reusable, and a later setup request
can refresh one app or stale section. It does not require exercising every
feature or treat an unrun command as verified. Missing facts and coverage remain
explicit rather than blocking unrelated work.

The QA capture helpers optionally use the target project's installed
`@playwright/test` or `playwright`; browser tools can be used without those
helpers. Authentication uses the target app's real UI. Evidence stays local
unless sharing is authorized and a supported destination is available.

See the official [Codex skill locations](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills), [Claude Code skills](https://code.claude.com/docs/en/skills), and [Cursor skill directories](https://cursor.com/docs/skills#skill-directories) for discovery and invocation details. Install paths above cover local use; cloud and remote environments may need their own setup.

## Develop

Create `skills/<skill-name>/SKILL.md` with YAML frontmatter containing `name` and `description`. Write focused guidance that captures preferences or changes decisions; put substantial conditional guidance in linked references. Try changes on a realistic task before releasing.

Validate with [skilllint](https://github.com/bueti/skilllint), an existing Go linter and library for the Agent Skills specification. Requires Go 1.25 or newer:

```sh
go install github.com/bueti/skilllint/cmd/skilllint@v0.3.0
"$(go env GOPATH)/bin/skilllint" lint --strict skills/
```

CI uses the same pinned version, treats warnings as failures, and reports GitHub annotations. GitHub Actions are pinned to full commit SHAs, and setup-go caches the Go modules and compiled build outputs using the validation workflow as the cache dependency key. When upgrading skilllint, update both the install command here and the validation workflow. It checks skill frontmatter, structure, and references; it does not validate Codex-specific `agents/openai.yaml` metadata or prove the instructions make good decisions.

## Releases

[release-please](https://github.com/googleapis/release-please-action) manages versions, the changelog, release PRs, and GitHub releases. All skills share a repository version. **CI - gate** is required on `main` and `release/**` for PR titles and skills. **CI - release** is additionally required on `release/**`; it always reports a status and uses path filters to select release checks. Squash merges use the PR title as the merge commit message. Generated release PRs merge automatically. See [RELEASING.md](RELEASING.md) for setup and the release workflow.

## License

This repository is source-available under the custom [Skills No-Resale License](LICENSE). Use and modification are free, including commercial projects and paid client work. You may charge for your work and its results, but may not sell the skills themselves, modified versions, or access to them, including in paid bundles. Free redistribution requires keeping the license and notices intact. Independent work produced using the skills is not covered by this license.
