import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {fetchDomUncached} from '../helpers/fetch-dom.js';
import {buildRepoURL} from '../github-helpers/index.js';

function isActionJobDetailPage(): boolean {
	return /^actions\/runs\/\d+\/job\/\d+/.test(
		pageDetect.utils.getRepositoryInfo()?.path ?? '',
	);
}

function getRunId(): string | undefined {
	return /actions\/runs\/(\d+)\/job\//.exec(location.pathname)?.[1];
}

function getJobName(): string | undefined {
	const heading = document.querySelector([
		'.CheckRun-log-title', // Job name in the log header
		'h2.PageHeader-title', // Possible future React-based header
	].join(','));
	return heading?.textContent?.trim();
}

function createSummaryContainer(children: ChildNode[]): JSX.Element {
	const container = (
		<div className="rgh-action-job-summary mb-3">
			<div className="Box">
				<div className="Box-header">
					<h3 className="Box-title">Job Summary</h3>
				</div>
				<div className="Box-body markdown-body" />
			</div>
		</div>
	);

	container.querySelector('.Box-body')!.append(...children);
	return container;
}

async function addSummary(stepsContainer: HTMLElement): Promise<void> {
	const runId = getRunId();
	if (!runId) {
		return;
	}

	const jobName = getJobName();
	if (!jobName) {
		return;
	}

	const summaryUrl = buildRepoURL('actions', 'runs', runId);

	// Fetch the summary page
	let summaryDom: DocumentFragment;
	try {
		summaryDom = await fetchDomUncached(summaryUrl);
	} catch {
		return;
	}

	// Look for job summary content in the fetched page.
	// GitHub renders summaries in cards with the job name as heading.
	const summaryContent = findJobSummary(summaryDom, jobName);

	if (summaryContent) {
		stepsContainer.parentElement!.insertBefore(
			createSummaryContainer(summaryContent),
			stepsContainer,
		);
		return;
	}

	// If summaries are behind lazy-loading elements, try fetching fragment URLs
	const fragmentContent = await fetchLazyJobSummary(summaryDom, jobName);
	if (fragmentContent) {
		stepsContainer.parentElement!.insertBefore(
			createSummaryContainer(fragmentContent),
			stepsContainer,
		);
		return;
	}

	// Fallback: link to the summary page
	stepsContainer.parentElement!.insertBefore(
		<div className="rgh-action-job-summary mb-3">
			<a href={summaryUrl} className="Link--muted">
				View job summary on the run summary page
			</a>
		</div>,
		stepsContainer,
	);
}

function findJobSummary(dom: DocumentFragment, jobName: string): ChildNode[] | undefined {
	// Strategy 1: Look for summary cards/sections that contain the job name
	// GitHub wraps each job summary in a container with the job name as a heading
	const allHeadings = dom.querySelectorAll([
		'h1', // Top-level heading
		'h2', // Section heading
		'h3', // Sub-section heading
		'h4', // Minor heading
		'[role="heading"]', // ARIA heading
	].join(','));
	for (const heading of allHeadings) {
		if (heading.textContent?.trim() === jobName) {
			// Found the heading for this job — get the sibling summary content
			const card = heading.closest([
				'.markdown-body', // Standard rendered markdown
				'[data-testid*="summary"]', // React summary container
				'.Box', // Generic box container
				'.job-summary', // Job summary specific
			].join(','));
			if (card) {
				return [...card.childNodes];
			}

			// Try the next sibling element (heading then content pattern)
			const nextSibling = heading.nextElementSibling;
			if (nextSibling?.classList.contains('markdown-body') ?? nextSibling?.querySelector('.markdown-body')) {
				const markdownBody = nextSibling.classList.contains('markdown-body')
					? nextSibling
					: nextSibling.querySelector('.markdown-body')!;
				return [...markdownBody.childNodes];
			}
		}
	}

	// Strategy 2: Look for markdown-body sections inside job summary containers
	const summaryContainers = dom.querySelectorAll('.markdown-body');
	if (summaryContainers.length === 1) {
		// If there's exactly one markdown-body (single job), use it directly
		const content = summaryContainers[0];
		if (content.children.length > 0) {
			return [...content.childNodes];
		}
	}

	return undefined;
}

async function fetchLazyJobSummary(dom: DocumentFragment, jobName: string): Promise<ChildNode[] | undefined> {
	// Look for include-fragment or batch-deferred-content elements
	const fragments = dom.querySelectorAll([
		'include-fragment[src]', // Standard lazy fragment
		'batch-deferred-content[data-url]', // Batch lazy content
	].join(','));
	if (fragments.length === 0) {
		return undefined;
	}

	// Collect fragment URLs that likely contain job summaries
	const fragmentUrls: string[] = [];

	for (const fragment of fragments) {
		const fragmentUrl = fragment.getAttribute('src') ?? fragment.getAttribute('data-url');
		if (!fragmentUrl) {
			continue;
		}

		// Only fetch URLs that look related to job summaries
		if (fragmentUrl.includes('job_groups') || fragmentUrl.includes('summary') || fragmentUrl.includes('job')) {
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

function init(signal: AbortSignal): void {
	observe('.js-check-steps', addSummary, {signal});
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
