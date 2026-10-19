---
name: verify-in-browser
description: Required before opening ANY pull request in the Refined GitHub repo (bug fix, feature, CSS tweak, selector update, dependency bump touching a feature). Loads the built extension into a real Chromium, reproduces the bug on github.com with a screenshot, applies the fix, proves it with a second screenshot, and attaches both to the PR. Use whenever you are about to fix an issue, write a PR description, or claim a change "works". A PR without before/after screenshots from the real site will be closed.
---

# Verify in browser

A PR is useful only when it is verified on the real github.com. Code is cheap; evidence is the contribution.

**Never open a PR unless you have a `before.png` showing the bug and an `after.png` showing it fixed, both produced by this procedure.** Never fabricate, mock, or reuse screenshots. If you cannot verify, do not open a PR; comment on the issue with what you found.

## 0. Triage

1. Read the issue. Extract the repro URL and the exact expected vs actual behavior.
2. Find the feature in `source/features/<feature-id>.tsx`.
3. Decide if the repro needs a logged-in session (merge box, review UI, notifications, private repos, anything with write actions). If the issue gives no usable public URL, find one in the issue's linked repos/PRs; if none exists, stop and ask the user.
4. Define a **machine-checkable assertion** for the bug (a locator that must/must not exist, a computed style, an attribute, text content). "Looks right" is not an assertion. Reuse the same assertion before and after.

## 1. Setup (once)

```fish
npm install
bunx playwright install chromium
```

- Use Playwright's bundled **Chromium**. Branded Chrome ignores `--load-extension`.
- Persistent profile **outside the repo**: `~/.cache/refined-github-verify/profile`. This keeps the GitHub login between runs.
- Write the helper script to a temp dir (`mktemp -d`). Never commit it, the profile, or the screenshots.

Launch:

```ts
const context = await chromium.launchPersistentContext(profile, {
	headless: false, // required for login; extensions need a real window
	viewport: {width: 1280, height: 900},
	deviceScaleFactor: 2,
	args: [`--disable-extensions-except=${dist}`, `--load-extension=${dist}`],
});
```

`dist` is the absolute path of the build output folder containing `manifest.json` (`distribution/`; confirm in `package.json`). Run the script with `bun`, or `node` if Playwright misbehaves under Bun.

Confirm the extension is actually loaded before trusting any result: `html.refined-github` must exist on a github.com page. If not, the run is invalid.

Make sure the feature under test is enabled in the extension options (features can be disabled by default or by `.disable` flags).

## 2. Login gate

Logged in = `document.querySelector('meta[name="user-login"]')?.content` is non-empty.

If the repro needs login and you are not logged in: **stop.** Leave the headed window open on `https://github.com/login` and tell the user:

> Please log into GitHub in the Chromium window I opened, then reply "done". I'll continue with the repro URL from the issue.

Wait for their reply. Never ask for, type, or store credentials or tokens. Never use the user's normal browser profile.

## 3. Validate the bug (BEFORE)

1. `git status` must be clean and HEAD must be the unmodified base branch (`git stash -u` if needed).
2. `npm run build`
3. Launch, open the repro URL, wait for the feature to run (wait on the page's content, not a fixed sleep).
4. Run the assertion. **It must fail**, confirming the bug.
5. Save `before.png`: full viewport, plus a tight `locator.screenshot()` of the affected element if useful. Pick the URL, viewport, and zoom now; reuse them for AFTER.

If the assertion passes (bug not reproduced): **stop.** Do not write a fix. Comment on the issue with the URL, extension version, and screenshot, and ask for a repro.

## 4. Fix

Make the smallest change that fixes the bug. Follow `contributing.md`. Run the repo's lint and tests (`npm test`).

## 5. Validate the fix (AFTER)

1. `npm run build`
2. Close the old browser and relaunch with the same profile (fresh extension load; do not trust a hot reload).
3. Same URL, viewport, and zoom as BEFORE.
4. Run the same assertion. **It must now pass.**
5. Save `after.png` the same way.
6. Check one adjacent page where the feature must not trigger. Confirm no visible regression, and the browser console shows no new errors from the extension.

If AFTER fails, go back to step 4. Never open a PR with a failing AFTER.

## 6. Open the PR with screenshots

GitHub has no API for image upload, so use the web uploader with the logged-in profile:

1. Push the branch, then `gh pr create --draft --title "<title>" --body "Verification in progress"`.
2. In Playwright, open the PR page, click edit on the description, and `setInputFiles` on the form's file input with `[before.png, after.png]`.
3. Wait until the textarea value contains `user-attachments`, read the markdown it inserted, then cancel the edit without saving.
4. Build the final body (template below) and run `gh pr edit <n> --body-file <file>`, then `gh pr ready <n>`.

If the upload fails, stop and ask the user to drag the two files into the PR description. Do not commit images to the repo or use external image hosts.

## PR body template

```md
Fixes #<issue>

## Before
<uploaded before.png>

## After
<uploaded after.png>

## Verified
- URL: <repro URL>
- Assertion: `<locator / check>` failed before, passes after
- Built from: <short commit SHA>, Chromium <version>
- Logged in: yes/no
```

## Hard stops (ask the user, do not proceed)

- Login required and not logged in
- Bug not reproduced on the real site
- Extension not detected (`html.refined-github` missing)
- Fix needs a state you cannot reach (specific repo permissions, org settings, GitHub Enterprise, feature-flagged UI)
- AFTER assertion fails or cannot be run
- Screenshot upload fails
