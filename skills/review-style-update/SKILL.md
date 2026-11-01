---
name: review-style-update
description: Update the reviewer's local review-style store from their newer code reviews. Collects the reviewer's comments on other people's PRs since the last sync, sorts them by code area, and proposes new rules, new examples, and replaced examples. Applies the changes only after the reviewer approves them. Use when the user asks to update, refresh, or retrain their review style, review skill, or its examples. Do not run it otherwise.
---

# Update the review style

This skill keeps the reviewer's local review-style store in line with how they review code now. Run it only when the reviewer asks. Never change the store without the reviewer's approval.

## Files

- [`collect_reviews.mjs`](scripts/collect_reviews.mjs) collects the comments with the `gh` CLI and Node.js. It writes JSON lines with the PR, the kind (`inline`, `review`, or `issue`), the path and line, the body, the date, and the URL.
- The target is the local store, outside every installed skill:

  ```sh
  REVIEW_STYLE_HOME="${REVIEW_STYLE_HOME:-$HOME/.agents/review-style}"
  ```

  It holds one Markdown file per `review-style` reference name, such as `backend.md` or `voice.md`, and `state.json`. Create the directory and a file when you first need it.
- `state.json` records, for each repository, the date of the last sync (`lastSynced`), held-out PR numbers (`heldOut`), and a short note:

  ```json
  { "repos": { "owner/name": { "lastSynced": "YYYY-MM-DD", "heldOut": [], "note": "" } } }
  ```

The store holds verbatim review text from the reviewer's repositories. Keep it private. Never copy store content into the installed `review-style` skill, a skills repository, or any other shared location.

## Workflow

### 1. Find the scope

- Use the repository that the reviewer names. Otherwise use the current repository from `gh repo view --json nameWithOwner`.
- Use the date that the reviewer names. Otherwise read `lastSynced` for the repository from `state.json`. If there is no entry, use 30 days ago.
- Tell the reviewer the repository and the start date in one line before you collect.

### 2. Collect

Write the output to a private scratch directory. Run the script in the background if the window is longer than two weeks. Set `SKILL_DIR` to this installed skill's absolute directory.

```sh
node "$SKILL_DIR/scripts/collect_reviews.mjs" --repo <owner/name> --since <YYYY-MM-DD> --out <scratch>/reviews.jsonl
```

The script uses the signed-in `gh` user. Pass `--user` to collect for a different login. It skips PRs that the user wrote, and PRs in `heldOut` for the repository in `$REVIEW_STYLE_HOME/state.json`. Pass `--state <path>` for a different state file.

GitHub search returns the most recently updated PRs first. For an older window, pass `--by created --until <YYYY-MM-DD>`, so the search uses the creation date of the PR.

### 3. Read and filter

Read every record with text. Drop these:

- Every comment from a PR in `heldOut`. Those PRs are an eval set. Never use them as examples or as evidence for a rule.
- Bare approvals with no text.
- Thanks, praise, and short acknowledgements such as "ok cool" or "nice". Keep a few only when they add to the voice.
- Replies that make no sense without the thread. Read the thread on GitHub when a reply looks important.
- Any comment that holds personal or sensitive data, a secret, a token, or a private URL. Never copy these into the store.

### 4. Sort by area

Give each kept comment one area. Use the area map in `review-style`'s `SKILL.md`. Use the file path first, then the content. A comment can fit more than one area. Put it where the rule is most useful.

### 5. Compare with the rules

Read `review-style`'s `SKILL.md`, its reference for each area that has new comments, and the matching store files. For each comment, decide one outcome:

- **New rule.** The comment shows a concern that no rule covers. Write the rule, and add the comment as its example.
- **Better example.** A rule covers it, and the new comment shows the rule more clearly or more concretely than an example in the store.
- **More of the same.** A rule and a good example already cover it. Count it, and do not add it.
- **Changed view.** The comment goes against a rule. The reviewer may have changed direction. Flag it, and quote both.
- **New area.** Several comments share a concern that no reference covers. Propose a new store file for it.

A rule needs at least two comments, or one comment that states a clear standard ("generally we should...", "we normally..."). Do not turn a one-off remark into a rule.

Guard against overfitting:

- Add a rule only when the reviewer's comments state it. Never add a rule from your own review findings.
- Prefer a quote whose point is clear without the PR's context. Cut domain detail with "...".
- Put each example under the general rule it shows. Remove an example when its rule goes away.
- Use at most 2 examples from one PR in a store file. Keep the spread of PRs wide.
- When the reviewer changes view inside a thread, keep the final view only, and add a one-line note.
- Flag a comment from a PR you are reviewing in the same session. Recent work biases the choice.

### 6. Propose the changes

Show the reviewer a short change list, grouped by file. For each change, give the outcome, the rule text, the quote, and the PR number. Put "Changed view" items first, because they need a decision. Then stop and wait for approval.

### 7. Apply the approved changes

Write each change to the store file named after its area. Under each rule heading, put the rule, then its examples as block quotes.

- Copy quotes verbatim. You may join line breaks and cut a long quote with "...". Do not reword a quote.
- Cite each example as `(#<PR>, <file or "review body">)`.
- Keep each file at about 15 examples or fewer. When a file is full, replace the weakest or oldest example.
- Write rules in short, plain sentences. Name the reviewer as "the reviewer".
- A local rule may refine or contradict a shared rule. Say which shared rule it changes.

A rule that holds in any repository, with no quote and no repository name, can also improve the shared `review-style` skill. List such rules in the report as candidates. Change the shared skill only in its source repository, and only when the reviewer asks.

### 7a. Check the spread

Count the examples per PR in each store file. Fix any file with more than 2 examples from one PR.

```sh
cd "$REVIEW_STYLE_HOME" && for f in *.md; do echo "$f"; grep -o '^> .*(#[0-9]*' "$f" | grep -o '#[0-9]*$' | sort | uniq -c | sort -rn; done
```

### 8. Record the sync

Set `lastSynced` for the repository in `state.json` to today. Do this only after you apply the changes. If the reviewer approved no changes, still record the date, and say so.

### 9. Report

Give the number of comments read, kept, and added. List the changed files. Name any "Changed view" items that are still open, and any candidate rules for the shared skill.

## Limits

- This skill only edits files under `$REVIEW_STYLE_HOME`.
- It never posts to GitHub. It only reads.
- Store files apply in every repository the reviewer reviews, so keep rules true across repositories. Name a repository helper only inside an example.
