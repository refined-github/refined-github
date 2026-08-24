import './rerun-workflow-from-pr.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import SyncIcon from 'octicons-plain-react/Sync';
import {$optional, elementExists} from 'select-dom';
import {assertError} from 'ts-extras';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import showToast from '../github-helpers/toast.js';
import observe from '../helpers/selector-observer.js';

// The row's label is GitHub's display string: "<workflow> / <job> (<event>)", e.g.
// "Check: ClickUp Ticket Validation / validate-ticket / Validate ClickUp Ticket (pull_request)".
// Only the trailing event is dropped; the leading text belongs to `workflow_name`
// (which really can start with "Check:"), so stripping it would break the exact match.
function normalizeLabel(label: string): string {
	return label
		.replace(/\s*\((?:pull_request|push|pull_request_target|merge_group|schedule|workflow_dispatch)\)\s*$/v, '')
		.trim();
}

export function getActionsRunId(url: string): string | undefined {
	const parsedUrl = new URL(url, location.href);
	if (parsedUrl.origin !== location.origin) {
		return;
	}

	return /\/actions\/runs\/(\d+)(?:\/|$)/v.exec(parsedUrl.pathname)?.[1];
}

export function findWorkflowJob(jobs: AnyObject[], label: string): AnyObject | undefined {
	const wanted = normalizeLabel(label);
	const exactMatch = jobs.find(job =>
		wanted === `${job.workflow_name as string} / ${job.name as string}`);
	if (exactMatch) {
		return exactMatch;
	}

	const matches = jobs.filter(job =>
		wanted === job.name
		|| wanted.endsWith(` / ${job.name as string}`));
	return matches.length === 1 ? matches[0] : undefined;
}

async function getJobId(label: string, runId: string): Promise<number> {
	// Paginated manually because `api.v3paginated` delegates to the memoized `v3`,
	// which would resolve a job from an earlier attempt after a re-run. Large matrix
	// runs exceed one page, so stopping at the first would lose those jobs.
	const latestJobs: AnyObject[] = [];
	for (let page = 1; ; page++) {
		// eslint-disable-next-line no-await-in-loop
		const {jobs, total_count: totalCount} = await api.v3uncached(
			`actions/runs/${runId}/jobs?filter=latest&per_page=100&page=${page}`,
		);

		latestJobs.push(...jobs as AnyObject[]);
		if (latestJobs.length >= (totalCount as number) || (jobs as AnyObject[]).length === 0) {
			break;
		}
	}

	const current = findWorkflowJob(latestJobs, label);
	if (!current) {
		throw new Error(`Could not find a re-runnable Actions job for \u201C${normalizeLabel(label)}\u201D`);
	}

	// Only finished jobs can be re-run; GitHub rejects the rest anyway
	if (current.status !== 'completed') {
		throw new Error('This job is still running. Wait for it to finish before re-running it.');
	}

	return current.id as number;
}

async function rerunJob(event: Event): Promise<void> {
	const button = event.currentTarget as HTMLButtonElement;
	const label = button.dataset.checkName!;
	const runId = button.dataset.runId!;

	// Disable immediately so a double-click can't queue the job twice
	button.disabled = true;
	try {
		await showToast(async () => {
			const jobId = await getJobId(label, runId);
			// `v3uncached` because `v3` memoizes by arguments: re-clicking the same
			// job would otherwise replay the first response without a new request.
			// `responseFormat: 'text'` because a 201 comes back with an empty body,
			// which `JSON.parse` would choke on.
			const response = await api.v3uncached(`actions/jobs/${jobId}/rerun`, {
				method: 'POST',
				responseFormat: 'text',
				ignoreHttpStatus: true,
			});

			if (!response.ok) {
				// `responseFormat: 'text'` leaves the body unparsed, and an error page can
				// be empty or HTML, so a failed parse must fall back to a generic message
				let message: string | undefined;
				try {
					({message} = JSON.parse(response.content as string) as {message?: string});
				} catch {}

				throw new Error(message ?? 'Unable to re-run this job.');
			}
		}, {
			message: 'Re-running…',
			doneMessage: 'Job queued. Reload to see the new run.',
		});
	} catch (error) {
		// Only a failure returns control to the user: re-enable so they can retry
		assertError(error);
		button.disabled = false;
		return;
	}

	// The job is queued, but GitHub's merge-box takes a few seconds to poll and
	// re-render the row. Leaving the button enabled in that window invites a second
	// re-run that would fail ("already running"), so it stays disabled and switches
	// to a spinner until GitHub replaces the row on its own.
	button.setAttribute('aria-label', 'Re-run queued. Reload the page if the check doesn\u2019t update.');
	button.title = 'Re-run queued. Reload the page if the check doesn\u2019t update.';
	button.classList.add('rgh-rerun-workflow-from-pr-queued');
}

// Running checks show a spinner instead of one of the terminal state icons. The
// icon is the reliable signal; the text is only a fallback for states whose icon
// isn't in the list, and it deliberately excludes the check's own name, which can
// itself contain words like "pending".
function isInProgress(row: HTMLElement): boolean {
	if (elementExists('.octicon-check, .octicon-x, .octicon-skip, .octicon-square-fill, .octicon-stop, .octicon-alert, .octicon-dot-fill, .octicon-clock', row)) {
		return false;
	}

	// e.g. "Failing after 33s", "Successful in 3m", "in progress \u2014 ..."
	const status = $optional('[class*="StatusMeta"], .text-italic, .color-fg-muted', row)?.textContent ?? '';
	return /\b(in progress|queued|waiting|expected)\b/iv.test(status);
}

function addRerunButton(menuButton: HTMLButtonElement): void {
	const row = menuButton.closest('li') ?? menuButton.parentElement!;
	const actionLink = $optional<HTMLAnchorElement>('a[href*="/actions/runs/"]', row);
	const checkName = actionLink?.textContent.trim();
	const runId = actionLink && getActionsRunId(actionLink.href);
	if (!checkName || !runId) {
		return;
	}

	if (isInProgress(row)) {
		return;
	}

	// Cloning GitHub's own kebab button inherits its exact size, hover square and
	// muted color, which its CSS-module classes don't expose to us any other way
	const button = menuButton.cloneNode(true);
	button.removeAttribute('id');
	button.removeAttribute('aria-labelledby');
	button.removeAttribute('aria-controls');
	button.removeAttribute('aria-expanded');
	button.removeAttribute('aria-haspopup');
	button.removeAttribute('data-hotkey');
	button.classList.add('rgh-rerun-workflow-from-pr');
	button.title = `Re-run “${checkName}”`;
	button.setAttribute('aria-label', `Re-run “${checkName}”`);
	button.dataset.checkName = checkName;
	button.dataset.runId = runId;
	button.replaceChildren(<SyncIcon />);
	button.addEventListener('click', event => void rerunJob(event));

	menuButton.before(button);
}

function init(signal: AbortSignal): void {
	// Scoped to the Checks section; a bare kebab selector also matches unrelated
	// menus like comment headers (#9771). Both the React and legacy rows are covered.
	observe(
		[
			'section[aria-label="Checks"] button:has(> .octicon-kebab-horizontal)',
			'[data-testid="check-run-item"] button:has(> .octicon-kebab-horizontal)',
		],
		addRerunButton,
		{signal},
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/6794

Any PR with a failing GitHub Actions check.

*/
