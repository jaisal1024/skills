# Skills

Personal, reusable skills for Codex: instructions that capture how I want recurring work done. This repository is where I develop, review, and release them.

## Skills

| Skill | Purpose | Status |
| --- | --- | --- |
| [code-review](skills/code-review/SKILL.md) | Review changes for actionable bugs and regressions. | Starter; refine through real reviews. |

## Use a skill

Copy a skill's entire folder from `skills/` into your Codex skills directory (usually `~/.codex/skills/`, or `$CODEX_HOME/skills/` when configured). Check existing local changes before replacing a skill. Include the license when sharing copies.

Invoke it by name, for example:

```text
Use $code-review to review this branch against main.
```

Each skill has a `SKILL.md` entrypoint and optional `agents/openai.yaml` display metadata. Add scripts, references, or assets only when the workflow needs them.

## Develop

Create `skills/<skill-name>/SKILL.md` with YAML frontmatter containing `name` and `description`. Write focused guidance that captures preferences or changes decisions; put substantial conditional guidance in linked references. Try changes on a realistic task before releasing.

Validate with [skilllint](https://github.com/bueti/skilllint), an existing Go linter and library for the Agent Skills specification. Requires Go 1.25 or newer:

```sh
go install github.com/bueti/skilllint/cmd/skilllint@v0.3.0
"$(go env GOPATH)/bin/skilllint" lint --strict skills/
```

CI uses the same pinned version, treats warnings as failures, and reports GitHub annotations. When upgrading skilllint, update both the install command here and the validation workflow. It checks skill frontmatter, structure, and references; it does not validate Codex-specific `agents/openai.yaml` metadata or prove the instructions make good decisions.

## Releases

[release-please](https://github.com/googleapis/release-please-action) manages versions, the changelog, release PRs, and GitHub releases. All skills share a repository version. Use Conventional Commit messages, including for squash merges. See [RELEASING.md](RELEASING.md) for setup and the release workflow.

## License

This repository is source-available under the custom [Skills No-Resale License](LICENSE). Use and modification are free, including commercial projects and paid client work. You may charge for your work and its results, but may not sell the skills themselves, modified versions, or access to them, including in paid bundles. Free redistribution requires keeping the license and notices intact. Independent work produced using the skills is not covered by this license.
