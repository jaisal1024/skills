# AI prompts, agents, and model upgrades

Read this for prompt text, agent code, model or SDK upgrades, and LLM output limits. Raise a finding only when the code in front of you shows the problem. Local examples for this area, when present, are in the matching file of the local store (see `SKILL.md`).

## Keep dynamic values from breaking the prompt cache

Keep a dynamic value as coarse as the task allows, for example a date and not a time. Put it at the end of the model input. Ask how the model providers solve the same problem.

## Ask whether the prompt is the real fix

When code patches around model behavior, for example by raising a limit, ask whether a prompt change fixes the cause.

## Give an AI framework upgrade a manual checklist

An upgrade can change stored data and agent behavior that no code diff shows. Ask for a checklist that runs every agent path, including the safety paths.
