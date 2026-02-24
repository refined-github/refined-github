import React from 'dom-chef';
import {$optional} from 'select-dom/strict.js';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import fetchDom, {fetchDomUncached} from '../helpers/fetch-dom.js';
import {buildRepoURL} from '../github-helpers/index.js';

const defined = /^actions\/runs\/(?<runId>\d+)\/job\/\d+/;

function isActionJobDetailPage(): boolean {
	return defined.test(
		pageDetect.utils.getRepositoryInfo()?.path ?? '',
	);
}

function getRunId(): string | undefined {
	return defined.exec(
		pageDetect.utils.getRepositoryInfo()?.path ?? '',
	)?.groups?.runId;
}

function getJobName(): string | undefined {
	return $optional('.CheckRun-log-title')?.textContent?.trim();
}

function createSummaryContainer(children: ChildNode[]): JSX.Element {
	const body = <div className="Box-body markdown-body" />;
	body.append(...children);
	return (
		<div className="mb-3">
			<div className="Box">
				<div className="Box-header">
					<h3 className="Box-title">Job Summary</h3>
				</div>
				{body}
			</div>
		</div>
	);
}

async function addSummary(signal: AbortSignal): Promise<void> {
	const stepsContainer = $optional('.js-check-steps');
	if (!stepsContainer) {
		return;
	}

	const runId = getRunId();
	if (!runId) {
		return;
	}

	const jobName = getJobName();
	if (!jobName) {
		return;
	}

	const summaryUrl = buildRepoURL('actions', 'runs', runId);

	// Fetch the run summary page (memoized — content won't change within a session)
	let summaryDom: DocumentFragment;
	try {
		summaryDom = await fetchDom(summaryUrl);
	} catch {
		return;
	}

	// Look for job summary content in the fetched page
	const summaryContent = findJobSummary(summaryDom, jobName)
		?? await fetchLazyJobSummary(summaryDom, jobName);

	if (!summaryContent || signal.aborted) {
		return;
	}

	const summary = createSummaryContainer(summaryContent);
	stepsContainer.before(summary);
	signal.addEventListener('abort', () => {
		summary.remove();
	});
}

function findJobSummary(dom: DocumentFragment, jobName: string): ChildNode[] | undefined {
	// GitHub wraps each job summary in a container with the job name as a heading
	for (const heading of dom.querySelectorAll('h3')) {
		if (heading.textContent?.trim() === jobName) {
			const card = heading.closest('.markdown-body');
			if (card) {
				return [...card.childNodes];
			}

			// Heading-then-content pattern: the summary follows the heading
			const nextSibling = heading.nextElementSibling;
			const markdownBody = nextSibling?.classList.contains('markdown-body')
				? nextSibling
				: nextSibling?.querySelector('.markdown-body');
			if (markdownBody) {
				return [...markdownBody.childNodes];
			}
		}
	}

	// If there's exactly one markdown-body (single job), use it directly
	const summaryContainers = dom.querySelectorAll('.markdown-body');
	if (summaryContainers.length === 1 && summaryContainers[0].children.length > 0) {
		return [...summaryContainers[0].childNodes];
	}

	return undefined;
}

async function fetchLazyJobSummary(dom: DocumentFragment, jobName: string): Promise<ChildNode[] | undefined> {
	// Look for lazy-loaded summary fragments
	const fragments = dom.querySelectorAll('include-fragment[src]');
	if (fragments.length === 0) {
		return undefined;
	}

	const fragmentUrls: string[] = [];
	for (const fragment of fragments) {
		const fragmentUrl = fragment.getAttribute('src')!;
		// Only fetch URLs that look related to job summaries
		if (fragmentUrl.includes('job_groups') || fragmentUrl.includes('summary')) {
			fragmentUrls.push(fragmentUrl);
		}
	}

	const results = await Promise.allSettled(fragmentUrls.map(async url => {
		const fragmentDom = await fetchDomUncached(url);
		return findJobSummary(fragmentDom, jobName);
	}));

	for (const result of results) {
		if (result.status === 'fulfilled' && result.value) {
			return result.value;
		}
	}

	return undefined;
}

async function init(signal: AbortSignal): Promise<void> {
	await addSummary(signal);
}

void features.add(import.meta.url, {
	include: [
		isActionJobDetailPage,
	],
	init,
});

/*

Test URLs:

https://github.com/dorny/test-reporter/actions/runs/21307105130/job/61336980961
https://github.com/refined-github/refined-github/actions (navigate to a specific job)

*/
