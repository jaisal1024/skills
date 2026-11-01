# Claude Code comment-limit hook

[`comment-limit.mjs`](../scripts/comment-limit.mjs) is a Claude Code
`PreToolUse` hook for `Write`, `Edit`, `MultiEdit`, and `NotebookEdit`. It finds
comments that an edit adds and flags any comment whose content spans more than
the configured number of lines. It needs Node.js 18 or newer and has no
dependencies.

## Install

Install the skill for Claude Code, then add the hook to the target project's
`.claude/settings.json`. Merge it with any existing `hooks.PreToolUse` entries:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit|NotebookEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR:-.}/.claude/skills/durable-comments/scripts/comment-limit.mjs\" --max-comment-lines 2 --action warn",
            "timeout": 10,
            "statusMessage": "Checking comment length"
          }
        ]
      }
    ]
  }
}
```

For a personal installation, point the command at
`$HOME/.claude/skills/durable-comments/scripts/comment-limit.mjs` and put the
entry in `~/.claude/settings.json`. If the skill lives elsewhere, use that path;
the script does not depend on its location.

## Options

| Flag | Default | Effect |
| --- | --- | --- |
| `--max-comment-lines N` | `0` | Longest allowed comment, in content lines. `0` forbids new comments. |
| `--action warn` | `warn` | Adds the finding to Claude's context and shows it to the user; the edit proceeds. |
| `--action block` | | Denies the edit with the finding as the reason, so Claude must rewrite it. |

Start with `warn` and a limit of `2`. Switch to `block` once the limit matches
how the codebase actually comments.

## What counts

- Supported files: `.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`, `.go`, `.css`, `.py`,
  `.sh`, `.yaml`, `.yml`, `.toml`, `.sql`, `Dockerfile`, and `Makefile`. Other
  files pass through.
- Consecutive whole-line comments form one comment. A trailing comment after
  code counts on its own.
- Block-comment delimiters on their own lines (`/**`, `*`, `*/`) do not count,
  so a JSDoc is measured by its prose.
- Comment markers inside strings are ignored. A line-1 shebang is not a comment.
- For `Edit` and `MultiEdit`, a comment already present unchanged in the
  replaced text is not reported, so touching code near an existing long comment
  does not trigger the hook.

The hook enforces length only. Whether a comment is durable is still a judgment
the skill guides.
