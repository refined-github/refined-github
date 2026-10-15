Instructions for AI Agents

Mandatory: Read Before Making Any Changes

Exemptions: 

- PRs opened by GitHub Copilot or @fregante
- PRs that change the structure of the code/repo rather than bugfixes and features

Do not write or modify any code until you have read and followed these instructions.

Refined GitHub is a browser extension that enhances the actual GitHub website. A code change that looks correct, builds successfully, or passes automated tests is not sufficient. The change must be demonstrated to work on the real GitHub website with the modified extension installed.

Your job is not to produce code. Your job is to deliver a verified fix.

The Core Requirement

Every proposed fix must be verified against the actual GitHub website before you submit a pull request.

You must be able to demonstrate all three:

1. The original problem exists, or the reported behavior can be reproduced.
2. Your changes resolve the problem in the actual browser.
3. The relevant functionality still behaves correctly after the change.

Do not substitute unit tests, mocked DOMs, HTML fixtures, screenshots of locally recreated pages, successful builds, or code inspection for actual website verification.

These tools can assist your investigation, but they do not prove that a feature works on GitHub.

Phase 1: Understand the Problem Before Coding

Before editing any files:

1. Read the issue, bug report, or requested feature carefully.
2. Inspect the relevant feature implementation and its surrounding code.
3. Understand how the feature is activated, what GitHub page it affects, and what the user should observe.
4. Identify the actual GitHub URL or page context where the behavior should occur.
5. Launch a real browser with the current Refined GitHub extension installed.
6. Navigate to the actual GitHub website and investigate the reported behavior.

Determine how to observe the problem in the browser before deciding how to fix it.

If the issue describes an interaction, perform that interaction. If it describes a visual problem, inspect the actual rendered page. If it concerns navigation, follow the relevant navigation flow.

Do not assume the issue description is completely accurate. Investigate the behavior yourself.

If You Cannot Reproduce the Problem

Do not start guessing at a fix.

Investigate possible explanations, including:

* The feature is not enabled or activated.
* The relevant GitHub page requires authentication.
* The browser is not running the extension build you intended to test.
* GitHub’s page structure or behavior has changed.
* The issue occurs only under particular permissions, page states, or interactions.
* The reported problem is intermittent.

If you cannot reproduce the issue, explain what you investigated and what prevents you from verifying it. Do not invent a reproduction or claim that you verified a problem you never observed.

Phase 2: Establish a Working Browser Environment

Use the repository’s existing development instructions to build and run Refined GitHub.

You are responsible for figuring out the commands and tools needed to do this in your environment.

The required environment must allow you to:

* Launch a real browser with Refined GitHub installed.
* Open actual pages on github.com.
* Interact with the page as a user would.
* Inspect the rendered page and relevant browser state.
* Observe JavaScript errors and extension failures when useful.
* Reload the updated extension and repeat the same interaction after changing code.

You may use Playwright, browser automation tools, developer tools, or another suitable approach.

Do not assume a particular automation framework is installed. Inspect the repository and available environment first.

Prefer a persistent browser session so that you can investigate, modify the code, reload the extension, and retry without repeatedly setting up the environment.

Use a dedicated browser profile where appropriate. Never expose credentials, cookies, session tokens, or other secrets in source code, logs, or pull requests.

Phase 3: Determine the Verification Procedure Before Implementing the Fix

Before writing code, decide exactly how you will establish that the fix works.

You must identify:

* Target: The actual GitHub page or workflow affected.
* Starting state: What must be true before the feature is exercised.
* Action: What a user or browser automation agent must do.
* Expected result: What observable behavior demonstrates success.
* Failure condition: What you would observe if the problem remained.

This is an investigation plan, not a requirement to write a regression test.

You do not need to create a test file, add a test framework, or introduce permanent testing infrastructure.

You must, however, know how you will verify the fix before you implement it.

If you cannot determine a credible way to observe the expected behavior, continue investigating rather than writing speculative code.

Phase 4: Implement the Smallest Appropriate Fix

Once you understand the actual behavior and have a way to verify the outcome:

1. Make the smallest reasonable change that addresses the issue.
2. Follow the repository’s existing coding conventions and feature architecture.
3. Avoid unrelated refactoring or opportunistic changes.
4. Do not modify unrelated features to make verification easier.
5. Do not add artificial conditions that make the observed scenario pass without fixing the underlying behavior.

Build the extension using the repository’s normal development workflow.

A successful build is a prerequisite for browser verification, not evidence that the fix works.

Phase 5: Verify the Fix on the Actual Website

Return to the same real GitHub page and reproduce the original scenario with your modified extension installed.

Perform the interaction you identified before coding.

Observe the actual outcome.

Depending on the issue, this might mean:

* Confirming that a missing UI element appears.
* Confirming that an existing element disappears or changes correctly.
* Clicking a button and observing its real effect.
* Following a link and checking the resulting destination.
* Changing a page state and checking the resulting interface.
* Confirming that the feature activates on the appropriate pages.
* Confirming that the feature does not activate in an inappropriate context.

Do not stop at checking whether an element exists if the feature is supposed to perform an action. Exercise the action and verify its result.

Do not stop at checking whether a page loads if the fix concerns a particular feature.

Use Evidence Appropriate to the Behavior

Inspect the browser directly. Use screenshots, rendered DOM inspection, console output, network information, or browser automation assertions as appropriate.

These are ways to gather evidence from the real website. They are not substitutes for exercising the relevant behavior.

After making changes, ensure the browser is running the updated extension rather than a stale build.

Repeat the original reproduction steps.

A fix is verified only when the expected behavior is observed with the modified extension on the actual GitHub website.

Phase 6: Investigate Failures Rather Than Reporting Success Prematurely

If the fix does not work:

1. Inspect the current browser state.
2. Examine relevant console errors and extension runtime errors.
3. Determine whether the extension loaded the intended changes.
4. Identify the actual cause of the failure.
5. Modify the implementation as needed.
6. Rebuild, reload, and repeat the interaction.

Continue until the fix works or you establish that you cannot complete verification.

Do not hide failures, weaken the expected outcome, or claim success because the implementation appears logically correct.

If the environment is broken, authentication is unavailable, or GitHub prevents meaningful verification, report the limitation honestly. An unverified fix must never be described as verified.

Phase 7: Submit Only a Verified Pull Request

Before opening a PR, confirm that:

* The original issue was investigated on the actual website.
* The intended behavior was reproduced or otherwise established.
* The modified extension was loaded into the browser.
* The relevant interaction was repeated after the change.
* The expected outcome was observed.
* Any remaining limitations are explicitly disclosed.

Include a concise verification summary in the PR description.

Describe the actual page or workflow you used, the actions you performed, and what you observed.

Include useful screenshots or other evidence when they help reviewers understand the result.

Do not claim that the fix was verified if you only built the project, ran automated tests, inspected the code, or tested a mock page.

If you cannot verify the behavior, do not open a PR presenting the change as a working fix.

Things You Must Not Do

* Do not write code before investigating the actual behavior.
* Do not treat a successful build as proof of correctness.
* Do not substitute mock pages or fixtures for the actual website.
* Do not assume a unit test proves that a browser extension works.
* Do not create tests merely to give the PR the appearance of verification.
* Do not claim success based on your own description of what the code should do.
* Do not submit speculative fixes when you cannot establish how to verify them.
* Do not conceal environmental limitations or failed verification.
* Do not open a PR that claims a working fix without observing the relevant behavior on the real website.

Definition of Done

The task is complete when the requested behavior has been demonstrated to work on the actual GitHub website with your modified version of Refined GitHub installed.

The implementation is a means to that outcome, not the outcome itself.

When verification is impossible, state what you tried, what happened, and what remains unresolved. Never fabricate evidence.

When verification succeeds, submit the smallest appropriate change together with a factual account of the browser verification you performed.
