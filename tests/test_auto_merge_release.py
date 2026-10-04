"""Exercise release automation with a fake GitHub CLI; never call GitHub."""
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/auto_merge_release.sh"
MOCK_GH = r"""#!/usr/bin/env python3
import json, os, sys
from pathlib import Path
args = sys.argv[1:]
with open(os.environ["CALL_LOG"], "a") as log:
    log.write(json.dumps(args) + "\n")
pr = json.loads(os.environ["MOCK_PR"])
endpoint = next((arg for arg in args if arg.startswith("repos/")), "")
if args[0] == "api" and endpoint == "repos/owner/skills/pulls":
    print(json.dumps([[pr]]))
elif args[0] == "api" and endpoint.endswith("/files"):
    print(json.dumps([json.loads(os.environ["MOCK_FILES"])]))
elif args[0] == "api" and "/pulls/" in endpoint:
    if "--jq" in args:
        print(os.environ.get("MOCK_MERGED", "true"))
    else:
        print(json.dumps(pr))
elif args[:2] == ["pr", "merge"] and os.environ.get("MOCK_MERGE_FAIL"):
    sys.exit(1)
"""


class ReleaseAutomationTest(unittest.TestCase):
    def run_automation(self, *, author="skills-release[bot]", files=None,
                       merged="true", merge_fail=False, new_prs='[{"number": 7}]', branch="main"):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "gh").write_text(MOCK_GH)
            (root / "gh").chmod(0o755)
            (root / "sleep").write_text("#!/bin/sh\nexit 0\n")
            (root / "sleep").chmod(0o755)
            pr = {"number": 7, "labels": [{"name": "autorelease: pending"}], "state": "open", "draft": False, "user": {"login": author},
                  "base": {"ref": branch}, "title": "chore(main): release 0.1.0",
                  "head": {"sha": "abc123", "ref": "release-please--branches--main",
                           "repo": {"full_name": "owner/skills"}}}
            env = {**os.environ, "PATH": str(root) + os.pathsep + os.environ["PATH"],
                   "GH_REPO": "owner/skills", "RELEASE_BOT_LOGIN": "skills-release[bot]", "RELEASE_BRANCH": branch,
                   "RELEASE_PRS": new_prs, "MOCK_PR": json.dumps(pr),
                   "MOCK_FILES": json.dumps(files or [{"filename": "version.txt"}]),
                   "MOCK_MERGED": merged, "CALL_LOG": str(root / "calls")}
            if merge_fail:
                env["MOCK_MERGE_FAIL"] = "1"
            result = subprocess.run(["bash", str(SCRIPT)], env=env,
                                    capture_output=True, text=True)
            calls = [json.loads(line) for line in (root / "calls").read_text().splitlines()]
            return result, calls

    def test_release_merges_exact_head_and_dispatches_publication(self):
        result, calls = self.run_automation()
        self.assertEqual(result.returncode, 0, result.stderr)
        statuses = [call for call in calls if call[:2] == ["api", "repos/owner/skills/statuses/abc123"]]
        self.assertEqual(len(statuses), 1)
        merge = next(call for call in calls if call[:2] == ["pr", "merge"])
        self.assertEqual(merge[merge.index("--match-head-commit") + 1], "abc123")
        self.assertIn(["workflow", "run", "release-please.yml", "--repo", "owner/skills", "--ref", "main"], calls)

    def test_release_branch_gets_both_required_exemptions(self):
        result, calls = self.run_automation(branch="release/1.x")
        self.assertEqual(result.returncode, 0, result.stderr)
        statuses = [call for call in calls if call[:2] == ["api", "repos/owner/skills/statuses/abc123"]]
        self.assertEqual({call[call.index("-f", call.index("-f") + 1) + 1] for call in statuses},
                         {"context=CI - gate", "context=CI - release"})

    def test_existing_pending_release_is_retried_without_new_action_output(self):
        result, calls = self.run_automation(new_prs="[]")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(any(call[:2] == ["pr", "merge"] for call in calls))
        self.assertTrue(any(call[:2] == ["workflow", "run"] for call in calls))

    def test_human_pr_cannot_receive_exemptions(self):
        result, calls = self.run_automation(author="someone")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("/statuses/" in " ".join(call) for call in calls))

    def test_other_bot_cannot_receive_exemptions(self):
        result, calls = self.run_automation(author="github-actions[bot]")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("/statuses/" in " ".join(call) for call in calls))

    def test_code_changes_cannot_receive_exemptions(self):
        result, calls = self.run_automation(files=[{"filename": "skills/code-review/SKILL.md"}])
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(any("/statuses/" in " ".join(call) for call in calls))

    def test_failed_or_pending_merge_never_dispatches_publication(self):
        for options in ({"merged": "false"}, {"merge_fail": True}):
            with self.subTest(options=options):
                result, calls = self.run_automation(**options)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(any(call[:2] == ["workflow", "run"] for call in calls))


if __name__ == "__main__":
    unittest.main()
