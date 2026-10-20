---
name: maintainer-workflow
description: Repo-specific rules for drafting PRs on behalf of a Refined GitHub maintainer, under their account and reviewed by them first. Covers PR and commit naming, PR body, branch handling and the playbook for selector breakage. Not for outside contributors, who follow agents.md instead.
disable-model-invocation: true
---

# Maintainer workflow

Only for drafts opened under a maintainer's account and reviewed by them before anyone else sees them (the exemption in `agents.md`). The maintainer's instructions in the current session override this file.

## Naming

- Title and commit header: `` `feature-id` - Description ``. Never Conventional Commits. Non-user-facing changes: `Meta: Description`.
- Selector breakage: `Restore feature` when the broken selector is the feature's main hook, `Restore feature on <where>` when only one page or part broke. Never `Update selectors`.
- Commit as the maintainer. Trailer: `Co-authored-by: Claude <noreply@anthropic.com>`.

## PR body

- First line: `Created by Claude, will be reviewed by @<maintainer> first.` Then one or two sentences.
- `Fixes #N` for every specific issue the PR addresses, not just a mention (the maintainer verifies before merging). `Part of #N` only for epics and umbrella issues.
- Mass breakage with an epic: every PR links to it with `Part of #epic`. Never edit the epic by hand, GitHub lists the linkbacks.
- Don't mention linting or tests in the PR or in chat.
- For feature bugs, paste ALL of the feature's test URLs verbatim: the `Test URLs` comment at the bottom of `source/features/<id>.tsx`, or the `_` export next to the selector in `source/github-helpers/selectors.ts`. Search open issues that mention the feature and link them.
- Say what was checked and what wasn't, including logged-out vs logged-in. Anything that needs a login becomes a reviewer task.
- Open as draft on the first push, then keep working.

## Branches

- `claude/<name>` from fresh `origin/main`. One PR per feature unless the diffs substantially overlap.
- If a PR for the feature is already open, push to it instead of opening another. Fetch the branch first (the maintainer may have pushed) and check that the PR is still open. Never push to the branch of a merged or closed PR.
- Merge `origin/main`. Never rebase or force-push. To split a PR, keep the existing branch for one feature (remove the rest in a new commit), retitle it, and open the others from fresh `origin/main`.
- Stage `source/` only. `npm install` can rewrite `package-lock.json` (package name, `libc` fields); never commit that.
- Read a PR's body and comments before editing it.
- Updating PRs: `PUT /pulls/<n>/update-branch` first. On conflict, merge locally and take `main`'s version where `main` refactored the file.
- Issue "claims" by contributors don't block a PR.

## Selector breakage

GitHub changes its markup often.

1. Read the tracking issue and every comment on it. Follow-up comments list more removed hooks. Then check `origin/main` and the latest tag: the fix may be merged but unreleased, so only fix what remains and use `Part of #N`.
2. Evidence is the real page only, never other extensions or userstyles. If it can't be seen logged out (client-rendered lists, menus, merge box), don't guess: ask the maintainer to fetch specific URLs logged in. Diagnose against the real page: curl it logged out (public repos work; React pages embed rendered markup). Logged-out markup can differ from logged-in: attributes such as `data-hovercard-type` may be missing and `data-testid` values can differ. Prefer hooks present in both (`href`, `aria-label`, `prc-*`, `data-testid`) and say which markup you checked.
3. CSS-module class names lost their file prefix: `Foo-module__bar___hash` is now `bar__hash`. Use `[class*="bar"]`, never `^=` (class order is unstable). Scope it to a stable ancestor. Repo links share list markup with issue and PR links, so filter by `href` where it matters.
4. After fixing one feature, `git grep` the same selectors and class names (also in `.css` and `.svelte` files and `selectors.ts`) and open one PR per other affected feature. A shared selector in `selectors.ts` goes in the PR of the feature that consumes it.

## Checking a build in the sandbox

Complements `verify-in-browser`, which assumes a headed, logged-in browser.

- `tsdown` builds into `distribution/`. Playwright's Chromium loads it with `--headless=new` plus `--load-extension`. Logged-out public pages work; the extension only warns that it expects a login.
- If GitHub's asset host is blocked, pages stay un-hydrated but their server-rendered markup is enough for content-script features.
- Build `origin/main` in a `git worktree` and run the same script against both builds, so you see what the PR changes instead of only that nothing throws. Test each claim in the PR description, not just that the page loads.
- Collect `pageerror` events. An exception at module load (for example an invalid regex) disables that one feature while the rest keep running.

## Lint rules that surprise

- `byo/selectors-array`: a single selector is a string, not an array.
- `refined-github/no-optional-chaining`: use `!.`, or add a comment saying when the value can be null.
- Single-line `/** */` comments are flagged: use `//`.
- Style: modern compact TypeScript, `for...of`, keep unrelated comments, plain string concatenation over simple template literals.
- Format with `dprint fmt`.
