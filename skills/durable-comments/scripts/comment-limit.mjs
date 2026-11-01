#!/usr/bin/env node
// Claude Code PreToolUse hook: caps how many lines a single comment may span in an edit.
// Flags: --max-comment-lines N (default 0; 0 forbids all), --action block|warn (default warn).
// Self-contained so it runs from an installed skill folder without sibling modules.

// --- Args ---

function kebabToCamel(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

// Types come from the defaults: booleans take --flag/--no-flag, everything else takes the
// next arg. Unknown flags throw so a typo in settings.json fails loudly instead of silently.
function parseArgs(defaults = {}) {
  const config = { ...defaults };
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    if (arg.startsWith("--no-")) {
      const key = kebabToCamel(arg.slice(5));
      if (!(key in config)) {
        throw new Error(`Unknown argument: ${arg}`);
      }
      if (typeof defaults[key] !== "boolean") {
        throw new Error(`Cannot negate non-boolean argument: ${arg}`);
      }
      config[key] = false;
    } else {
      const key = kebabToCamel(arg.slice(2));
      if (!(key in config)) {
        throw new Error(`Unknown argument: ${arg}`);
      }
      if (typeof defaults[key] === "boolean") {
        config[key] = true;
      } else {
        config[key] = args[++i];
      }
    }
  }

  return config;
}

// --- Edit targets ---

// Normalizes Edit / Write / MultiEdit / NotebookEdit input into [{ file_path, new_text,
// old_text }]. old_text is undefined for tools that carry no prior content.
function fileTargets(toolName, toolInput) {
  if (toolName === "NotebookEdit") {
    return [
      {
        file_path: toolInput.notebook_path ?? "",
        new_text: toolInput.new_source ?? "",
      },
    ];
  }
  const newText =
    toolInput.content ??
    toolInput.new_string ??
    // Separate edits are non-contiguous insertions; join with a blank line so the
    // adjacency-based scanner doesn't fuse two unrelated edits into one synthetic run.
    (Array.isArray(toolInput.edits)
      ? toolInput.edits.map((e) => e.new_string ?? "").join("\n\n")
      : "");
  const oldText =
    toolInput.old_string ??
    (Array.isArray(toolInput.edits)
      ? toolInput.edits.map((e) => e.old_string ?? "").join("\n\n")
      : undefined);
  return [
    {
      file_path: toolInput.file_path ?? "",
      new_text: newText,
      old_text: oldText,
    },
  ];
}

const config = parseArgs({ maxCommentLines: 0, action: "warn" });
const MAX = Number(config.maxCommentLines);

if (!Number.isInteger(MAX) || MAX < 0) {
  throw new Error(
    `--max-comment-lines must be a non-negative integer, got: ${config.maxCommentLines}`
  );
}
if (config.action !== "block" && config.action !== "warn") {
  throw new Error(`--action must be "block" or "warn", got: ${config.action}`);
}

// --- Language comment/string syntax ---

const STR = {
  dq: { open: '"', close: '"', escape: true },
  sq: { open: "'", close: "'", escape: true },
  backtick: { open: "`", close: "`", escape: true },
  tripleDq: { open: '"""', close: '"""', escape: false },
  tripleSq: { open: "'''", close: "'''", escape: false },
  // SQL single-quoted strings escape via '' doubling, not backslash; treating \ as literal
  // is conservative — at worst we keep scanning string content as string, never as code.
  sqlStr: { open: "'", close: "'", escape: false },
};

const CSTYLE = {
  line: "//",
  block: ["/*", "*/"],
  strings: [STR.backtick, STR.dq, STR.sq],
};
const HASH = {
  line: "#",
  block: null,
  strings: [STR.tripleDq, STR.tripleSq, STR.dq, STR.sq],
};
const SQL = { line: "--", block: ["/*", "*/"], strings: [STR.sqlStr, STR.dq] };
// CSS has only block comments; granting it // would misread an unquoted url(http://…) as one.
const CSS = { line: null, block: ["/*", "*/"], strings: [STR.dq, STR.sq] };

const EXT_LANG = {
  ts: CSTYLE,
  tsx: CSTYLE,
  js: CSTYLE,
  mjs: CSTYLE,
  cjs: CSTYLE,
  go: CSTYLE,
  css: CSS,
  py: HASH,
  sh: HASH,
  yaml: HASH,
  yml: HASH,
  toml: HASH,
  sql: SQL,
};

const BASENAME_LANG = { Dockerfile: HASH, Makefile: HASH, makefile: HASH };

function langFor(filePath) {
  const base = filePath.split("/").pop() ?? "";
  if (BASENAME_LANG[base]) return BASENAME_LANG[base];
  const ext = base.includes(".") ? base.split(".").pop().toLowerCase() : "";
  return EXT_LANG[ext] ?? null;
}

// --- Scanner ---

// Char-walk over the inserted text; strings and block comments are consumed whole, so comment
// markers inside them never start a comment. Tracks whether code precedes a comment on a line.

function scanComments(text, lang) {
  const blocks = []; // { start, end, span }
  const lineComments = []; // { line, trailing, content }
  const n = text.length;
  let i = 0;
  let line = 1;
  let codeOnLine = false;
  const at = (s) => text.startsWith(s, i);

  while (i < n) {
    const c = text[i];

    // A line-1 shebang is not a comment.
    if (line === 1 && i === 0 && at("#!")) {
      while (i < n && text[i] !== "\n") i++;
      continue;
    }

    if (lang.block && at(lang.block[0])) {
      const start = line;
      const startIdx = i;
      i += lang.block[0].length;
      while (i < n && !at(lang.block[1])) {
        if (text[i] === "\n") line++;
        i++;
      }
      i += lang.block[1].length;
      blocks.push({
        start,
        end: line,
        span: blockContentSpan(text.slice(startIdx, i)),
      });
      codeOnLine = true;
      continue;
    }

    if (lang.line && at(lang.line)) {
      let j = i + lang.line.length;
      while (j < n && text[j] !== "\n") j++;
      lineComments.push({
        line,
        trailing: codeOnLine,
        content: text.slice(i + lang.line.length, j).trim() !== "",
      });
      i = j;
      continue;
    }

    const str = lang.strings.find((s) => at(s.open));
    if (str) {
      codeOnLine = true;
      i += str.open.length;
      while (i < n) {
        if (str.escape && text[i] === "\\") {
          if (text[i + 1] === "\n") line++;
          i += 2;
          continue;
        }
        if (at(str.close)) {
          i += str.close.length;
          break;
        }
        if (text[i] === "\n") line++;
        i++;
      }
      continue;
    }

    if (c === "\n") {
      line++;
      codeOnLine = false;
    } else if (!/\s/.test(c)) {
      codeOnLine = true;
    }
    i++;
  }

  return { blocks, lineComments };
}

// A comment's length is its content lines — bare scaffolding (/*, /**, lone *, */) doesn't
// count, so a JSDoc whose delimiters sit on their own lines is measured by its prose alone.
function blockContentSpan(blockText) {
  let count = 0;
  for (const raw of blockText.split("\n")) {
    let s = raw.trim();
    if (s.endsWith("*/")) s = s.slice(0, -2);
    if (s.startsWith("/*")) s = s.slice(2);
    if (s.replace(/^\*+/, "").trim() !== "") count++;
  }
  return count;
}

function commentRegions(text, lang) {
  const { blocks, lineComments } = scanComments(text, lang);
  const regions = blocks.map((b) => ({
    start: b.start,
    end: b.end,
    span: b.span,
  }));

  let run = null;
  for (const c of lineComments
    .filter((c) => !c.trailing)
    .sort((a, b) => a.line - b.line)) {
    if (run && c.line === run.end + 1) {
      run.end = c.line;
      if (c.content) run.span++;
    } else {
      if (run) regions.push(run);
      run = { start: c.line, end: c.line, span: c.content ? 1 : 0 };
    }
  }
  if (run) regions.push(run);

  for (const c of lineComments) {
    if (c.trailing)
      regions.push({ start: c.line, end: c.line, span: c.content ? 1 : 0 });
  }
  return regions;
}

function violations(text, lang) {
  return commentRegions(text, lang)
    .filter((r) => r.span > MAX)
    .sort((a, b) => b.span - a.span);
}

// diff newText + oldText to find which comments are actually newly added
function novelViolations(newText, oldText, lang) {
  const found = violations(newText, lang);
  if (found.length === 0 || !oldText) return found;
  const prior = new Set(
    commentRegions(oldText, lang).map((r) => snippet(oldText, r))
  );
  return found.filter((r) => !prior.has(snippet(newText, r)));
}

// --- Report ---

function snippet(text, region) {
  return text
    .split("\n")
    .slice(region.start - 1, region.end)
    .join("\n");
}

function describe(filePath, text, regions) {
  const worst = regions[0];
  const snip = snippet(text, worst);
  if (MAX === 0) {
    return `${filePath}: comments are disabled (max_comment_lines=0), but this edit adds one:\n${snip}`;
  }
  return `${filePath}: a comment spans ${worst.span} lines (max_comment_lines=${MAX}):\n${snip}`;
}

function policy() {
  if (MAX === 0) {
    return "Comment policy: no AI-generated comments allowed. Remove it, then retry.";
  }
  const limit =
    MAX === 1 ? "a single non-obvious line" : `at most ${MAX} lines`;
  return `Comment policy: default to no comment; when one is truly needed it must be ${limit}. Remove it or collapse it, then retry.`;
}

function emit(reason) {
  const isBlock = config.action !== "warn";
  console.log(
    JSON.stringify({
      systemMessage: reason,
      hookSpecificOutput: isBlock
        ? {
            hookEventName: "PreToolUse",
            permissionDecision: "deny",
            permissionDecisionReason: reason,
          }
        : { hookEventName: "PreToolUse", additionalContext: reason },
    })
  );
}

// --- Main ---

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const event = JSON.parse(Buffer.concat(chunks).toString() || "{}");
  if (event.hook_event_name && event.hook_event_name !== "PreToolUse") return;

  const reports = [];
  for (const target of fileTargets(
    event.tool_name ?? "",
    event.tool_input ?? {}
  )) {
    const lang = langFor(target.file_path ?? "");
    if (!lang || !target.new_text) continue;
    const found = novelViolations(target.new_text, target.old_text, lang);
    if (found.length > 0)
      reports.push(describe(target.file_path, target.new_text, found));
  }
  if (reports.length > 0) emit([...reports, policy()].join("\n\n"));
}

main();
