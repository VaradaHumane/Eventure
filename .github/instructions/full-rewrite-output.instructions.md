---
description: "When code changes are requested, return complete rewritten file content so it is copy-paste ready."
applyTo: "**"
---

If there are code changes, always provide the full updated file content in the response.

Requirements:
- Do not provide partial snippets only.
- Do not provide patch-only output.
- The output must be directly copy-paste ready.
- Preserve existing functionality unless the user asks to change behavior.
- Keep imports and exports complete and valid in the rewritten output.

Strictness:
- This is a hard rule for this workspace.
