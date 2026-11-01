#!/usr/bin/env node
// Collects one user's review comments on other people's PRs, newest PRs first, as JSON lines.
// Usage: collect_reviews.mjs --repo owner/name --since YYYY-MM-DD [--until YYYY-MM-DD] [--by updated|created] [--user login] [--limit 100] [--state state.json] --out file.jsonl
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce((pairs, arg, i, all) => (arg.startsWith("--") ? [...pairs, [arg.slice(2), all[i + 1]]] : pairs), [])
);
if (!args.repo || !args.since || !args.out) {
  console.error("Required: --repo owner/name --since YYYY-MM-DD --out file.jsonl");
  process.exit(1);
}

const gh = (ghArgs) => execFileSync("gh", ghArgs, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const jsonLines = (text) => text.split("\n").filter(Boolean).map((line) => JSON.parse(line));

const user = args.user ?? gh(["api", "user", "--jq", ".login"]).trim();
const limit = args.limit ?? "100";
const sinceMs = Date.parse(args.since);

const prs = JSON.parse(
  gh([
    "search", "prs",
    "--repo", args.repo,
    "--reviewed-by", user,
    `--${args.by === "created" ? "created" : "updated"}`,
    args.until ? `${args.since}..${args.until}` : `>=${args.since}`,
    "--limit", limit,
    "--json", "number,title,author",
  ])
).filter((pr) => pr.author?.login !== user);

// Held-out PRs are the eval set and must never reach the skill.
const statePath =
  args.state ?? join(process.env.REVIEW_STYLE_HOME || join(homedir(), ".agents", "review-style"), "state.json");
const heldOut = new Set(
  existsSync(statePath) ? JSON.parse(readFileSync(statePath, "utf8")).repos?.[args.repo]?.heldOut ?? [] : []
);
const skippedHeldOut = prs.filter((pr) => heldOut.has(pr.number)).map((pr) => pr.number);
prs.splice(0, prs.length, ...prs.filter((pr) => !heldOut.has(pr.number)));

const records = [];
for (const pr of prs) {
  const base = `repos/${args.repo}`;
  const byUser = `.[] | select(.user.login == "${user}")`;
  const inline = jsonLines(gh(["api", "--paginate", `${base}/pulls/${pr.number}/comments`, "--jq", `${byUser} | {path, line, body, created_at, html_url, in_reply_to_id}`]));
  const reviews = jsonLines(gh(["api", "--paginate", `${base}/pulls/${pr.number}/reviews`, "--jq", `${byUser} | {state, body, created_at: .submitted_at, html_url}`]));
  const issue = jsonLines(gh(["api", "--paginate", `${base}/issues/${pr.number}/comments`, "--jq", `${byUser} | {body, created_at, html_url}`]));

  const common = { pr: pr.number, title: pr.title, author: pr.author?.login };
  for (const c of inline) records.push({ ...common, kind: "inline", reply: c.in_reply_to_id != null, path: c.path, line: c.line, body: c.body, created_at: c.created_at, url: c.html_url });
  for (const r of reviews) records.push({ ...common, kind: "review", state: r.state, body: r.body, created_at: r.created_at, url: r.html_url });
  for (const c of issue) records.push({ ...common, kind: "issue", body: c.body, created_at: c.created_at, url: c.html_url });
}

const fresh = records.filter((r) => Date.parse(r.created_at) >= sinceMs);
writeFileSync(args.out, fresh.map((r) => JSON.stringify(r)).join("\n") + (fresh.length ? "\n" : ""));

const withText = fresh.filter((r) => r.body?.trim());
console.log(`user=${user} repo=${args.repo} since=${args.since}`);
console.log(`${prs.length} PRs, ${fresh.length} records, ${withText.length} with text → ${args.out}`);
if (skippedHeldOut.length) console.log(`skipped held-out PRs: ${skippedHeldOut.join(", ")}`);
