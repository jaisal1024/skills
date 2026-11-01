#!/usr/bin/env node
// Adds approved review comments to a PR as ONE pending review. Never submits: the payload has no `event`.
// Usage and the comments.json shape are in the "Post as a pending review" section of ../SKILL.md.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const repo = opt("repo");
const pr = opt("pr");
const commit = opt("commit");
const commentsPath = opt("comments");
if (!repo || !pr || !commit || !commentsPath) {
  console.error("Required: --repo owner/name --pr N --commit <sha> --comments comments.json");
  process.exit(1);
}

const gh = (args, input) =>
  execFileSync("gh", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, input });
const ghJson = (args) => JSON.parse(gh(args));
const ghPages = (path) =>
  gh(["api", "--paginate", path, "--jq", ".[]"]).split("\n").filter(Boolean).map((l) => JSON.parse(l));
const fail = (message) => {
  console.error(`STOP: ${message}`);
  process.exit(2);
};

const user = gh(["api", "user", "--jq", ".login"]).trim();
const pull = ghJson(["api", `repos/${repo}/pulls/${pr}`]);

if (pull.state !== "open") fail(`PR #${pr} is ${pull.state}.`);
if (!pull.head.sha.startsWith(commit) && !commit.startsWith(pull.head.sha)) {
  fail(`PR head is ${pull.head.sha.slice(0, 10)}, but the comments were drafted on ${commit.slice(0, 10)}. Re-check the comments against the new head.`);
}

const pending = ghPages(`repos/${repo}/pulls/${pr}/reviews`).filter(
  (r) => r.state === "PENDING" && r.user?.login === user
);
if (pending.length) {
  fail(`${user} already has a pending review on #${pr} (id ${pending[0].id}). Submit or discard it on GitHub first. This script never edits an existing draft.`);
}

// Each hunk lists the lines a comment can anchor to on each side of the diff.
function parsePatch(patch) {
  const hunks = [];
  let current;
  let left = 0;
  let right = 0;
  for (const text of patch.split("\n")) {
    const header = text.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (header) {
      left = Number(header[1]);
      right = Number(header[2]);
      current = { LEFT: new Set(), RIGHT: new Set() };
      hunks.push(current);
      continue;
    }
    if (!current || text.startsWith("\\")) continue;
    if (text.startsWith("+")) current.RIGHT.add(right++);
    else if (text.startsWith("-")) current.LEFT.add(left++);
    else {
      current.LEFT.add(left++);
      current.RIGHT.add(right++);
    }
  }
  return hunks;
}

const hunksByPath = new Map(
  ghPages(`repos/${repo}/pulls/${pr}/files`).map((f) => [f.filename, f.patch ? parsePatch(f.patch) : null])
);

const comments = JSON.parse(readFileSync(commentsPath, "utf8"));
const anchored = [];
const unanchored = [];
for (const c of comments) {
  const side = c.side ?? "RIGHT";
  const hunks = hunksByPath.get(c.path);
  let reason;
  if (!c.body?.trim()) reason = "empty body";
  else if (hunks === undefined) reason = "file is not in the PR diff";
  else if (hunks === null) reason = "GitHub shows no patch for this file (binary or too large)";
  else {
    const hunk = hunks.find((h) => h[side].has(c.line));
    if (!hunk) reason = `line ${c.line} (${side}) is outside the diff hunks`;
    else if (c.start_line != null && !hunk[side].has(c.start_line)) reason = `start_line ${c.start_line} is not in the same hunk as line ${c.line}`;
  }
  if (reason) unanchored.push({ ...c, reason });
  else anchored.push({ ...c, side });
}

console.log(`PR #${pr} head ${pull.head.sha.slice(0, 10)}, posting as ${user}`);
console.log(`anchored: ${anchored.map((c) => c.id ?? `${c.path}:${c.line}`).join(", ") || "none"}`);
for (const c of unanchored) console.log(`NOT ANCHORED ${c.id ?? ""} ${c.path}:${c.line}: ${c.reason}`);

if (unanchored.length && !flag("skip-unanchored")) {
  fail("some comments cannot anchor. Move them to the review body or drop them, or pass --skip-unanchored.");
}
if (!anchored.length) fail("no comments to post.");
if (flag("dry-run")) {
  console.log("dry run: nothing was posted.");
  process.exit(0);
}

const payload = {
  commit_id: pull.head.sha,
  comments: anchored.map((c) => ({
    path: c.path,
    line: c.line,
    side: c.side,
    ...(c.start_line != null && { start_line: c.start_line, start_side: c.side }),
    body: c.body,
  })),
  ...(opt("body-file") && { body: readFileSync(opt("body-file"), "utf8") }),
};
const payloadPath = join(mkdtempSync(join(tmpdir(), "pending-review-")), "payload.json");
writeFileSync(payloadPath, JSON.stringify(payload));

const review = JSON.parse(gh(["api", "-X", "POST", `repos/${repo}/pulls/${pr}/reviews`, "--input", payloadPath]));
if (review.state !== "PENDING") {
  console.error(`WARNING: GitHub returned state ${review.state} for review ${review.id}, not PENDING. Check the PR now.`);
  process.exit(3);
}
console.log(`pending review ${review.id} with ${anchored.length} comments: ${pull.html_url}/files`);
