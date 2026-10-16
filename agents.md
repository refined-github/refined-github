# Instructions for AI Agents

## Mandatory: Read Before Making Any Changes

Exemptions:

- PRs opened by GitHub Copilot or @fregante
- PRs that change the structure of the code/repo rather than bugfixes and features

Do not write or modify any code until you have read and followed these instructions.
Any AI agent opening a pull request must use a title that starts with `AI:`

Refined GitHub is a browser extension that enhances the actual GitHub website. A change that looks correct, builds, or passes automated tests is not sufficient. It must be demonstrated to work on the real GitHub website with the modified extension installed.

Your job is not to produce code. Your job is to deliver a verified fix.

## Procedure

Follow [`.agents/skills/verify-in-browser/SKILL.md`](.agents/skills/verify-in-browser/SKILL.md) for the whole workflow: reproduce the bug on github.com, fix it, verify the fix, and open the PR with `before.png` and `after.png` attached.

## Rules

- Investigate the actual behavior in a real browser before writing any code. Don't assume the issue is accurate.
- If you can't reproduce the problem, don't guess at a fix.
- If the feature performs an action, exercise the action and verify its result. An element existing is not enough.
- Confirm the feature still behaves correctly where it should, and doesn't activate where it shouldn't.
- Make the smallest reasonable change. No unrelated refactoring. Don't add conditions that only make the observed scenario pass.
- Never expose credentials, cookies, or tokens in code, logs, or PRs.

## Never

- Treat a build, unit test, mocked DOM, HTML fixture, recreated page, or code inspection as proof that a feature works.
- Add tests just to make a PR look verified.
- Claim success based on what the code should do.
- Hide failed verification or environment limitations. An unverified fix must never be described as verified.
- Fabricate evidence.
- Open a PR for a fix you couldn't verify. State what you tried, what happened, and what remains unresolved instead.

## Definition of Done

The requested behavior has been demonstrated on the actual GitHub website with your modified Refined GitHub installed, and the PR contains the before/after screenshots.
