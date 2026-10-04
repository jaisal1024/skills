#!/usr/bin/env bash
set -euo pipefail

# Process newly generated PRs and pending bot release PRs when retrying a run.
: "${RELEASE_PRS:?release-please PR output is required}"
: "${GH_REPO:?repository is required}"
: "${RELEASE_BRANCH:?release branch is required}"
: "${RELEASE_BOT_LOGIN:?dedicated release app bot login is required}"

jq -e 'type == "array" and all(.[]; (.number | type) == "number")' <<< "$RELEASE_PRS" > /dev/null
pending=$(gh api "repos/$GH_REPO/pulls" --method GET -f state=open \
  -f base="$RELEASE_BRANCH" --paginate --slurp |
  jq --arg repo "$GH_REPO" --arg base "$RELEASE_BRANCH" --arg bot "$RELEASE_BOT_LOGIN" '[flatten[] |
    select(.user.login == $bot and .base.ref == $base and
      .head.repo.full_name == $repo and
      (.head.ref | startswith("release-please--branches--")) and
      any(.labels[]; .name == "autorelease: pending")) | {number}]')
numbers=$(jq -r --argjson pending "$pending" '. + $pending | unique_by(.number) | .[].number' <<< "$RELEASE_PRS")
merged=false
while IFS= read -r number; do
  [[ -n "$number" ]] || continue
  pr=$(gh api "repos/$GH_REPO/pulls/$number")
  jq -e --arg repo "$GH_REPO" --arg base "$RELEASE_BRANCH" --arg bot "$RELEASE_BOT_LOGIN" '
    .state == "open" and .draft == false and
    .user.login == $bot and
    .base.ref == $base and .head.repo.full_name == $repo and
    (.head.ref | startswith("release-please--branches--"))
  ' <<< "$pr" > /dev/null
  sha=$(jq -r '.head.sha' <<< "$pr")
  title=$(jq -r '.title' <<< "$pr")

  # Release PRs may change version metadata only, never skills or workflows.
  gh api --paginate --slurp "repos/$GH_REPO/pulls/$number/files" |
    jq -e 'flatten | length > 0 and all(.[];
      .filename == "CHANGELOG.md" or
      .filename == "version.txt" or
      .filename == ".release-please-manifest.json")' > /dev/null

  # Record the verified release metadata exemption with the GitHub Actions token,
  # matching the integration required by branch protection.
  for context in 'CI - gate' 'CI - release'; do
    gh api "repos/$GH_REPO/statuses/$sha" --method POST \
      -f state=success -f context="$context" \
      -f description='Exempt: verified release-please metadata PR' > /dev/null
  done
  gh pr merge "$number" --repo "$GH_REPO" --auto --squash \
    --match-head-commit "$sha" --subject "$title"

  # Publication must be dispatched explicitly after a GITHUB_TOKEN merge.
  state=OPEN
  for attempt in {1..12}; do
    state=$(gh api "repos/$GH_REPO/pulls/$number" --jq '.merged')
    if [[ "$state" == true ]]; then
      merged=true
      break
    fi
    sleep 5
  done
  if [[ "$state" != true ]]; then
    echo "Release PR #$number has auto-merge enabled but did not merge within 60 seconds." >&2
    exit 1
  fi
done <<< "$numbers"

if [[ "$merged" == true ]]; then
  gh workflow run release-please.yml --repo "$GH_REPO" --ref "$RELEASE_BRANCH"
fi
