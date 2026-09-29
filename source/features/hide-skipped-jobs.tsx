import './hide-skipped-jobs.css';

import batchedFunction from 'batched-function';
import cx from 'clsx';
import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import EyeIcon from 'octicons-plain-react/Eye';
import EyeClosedIcon from 'octicons-plain-react/EyeClosed';
import {$$optional, $optional, elementExists} from 'select-dom';

import features from '../feature-manager.js';
import abortableClassName from '../helpers/abortable-classname.js';
import observe from '../helpers/selector-observer.js';

const hidingClass = 'rgh-hide-skipped-jobs';
const skippedClass = 'rgh-skipped-job';
const skippedConnectorClass = 'rgh-skipped-connector';
const toggleClass = 'rgh-hide-skipped-jobs-toggle';

const sidebarSkippedIcon = 'nav[aria-label="Workflow run"] a[data-test-selector="job-link"] .octicon-skip';
const graphSkippedIcon = '.WorkflowGraph .WorkflowJob-title .octicon-skip';

/** GitHub's custom HTML element that draws lines in between its Actions workflow cards */
type ActionGraph = HTMLElement & {drawLines?: () => void};

function markSkippedInGraph(): void {
	const hiddenCardIds = new Set<string>();

	for (const card of $$optional('.WorkflowGraph .WorkflowCard')) {
		const jobs = $$optional('streaming-graph-job', card);
		let skippedCount = 0;
		for (const job of jobs) {
			const isSkipped = elementExists('.WorkflowJob-title .octicon-skip', job);
			job.classList.toggle(skippedClass, isSkipped);
			if (isSkipped) {
				skippedCount++;
			}
		}

		// Matrix placeholders have no jobs. never hide them.
		const isHidden = jobs.length > 0 && skippedCount === jobs.length;
		card.classList.toggle(skippedClass, isHidden);
		if (isHidden) {
			hiddenCardIds.add(card.id);
		}
	}

	for (const line of $$optional('.WorkflowGraph .WorkflowConnector')) {
		line.classList.toggle(
			skippedConnectorClass,
			hiddenCardIds.has(line.dataset.from!) || hiddenCardIds.has(line.dataset.to!),
		);
	}

	// If we moved cards, we have to redraw the lines.
	$optional<ActionGraph>('action-graph')?.drawLines?.();
}

function updateToggle(): void {
	const toggle = $optional(`.${toggleClass}`);
	if (!toggle) {
		return;
	}

	const count = $$optional(sidebarSkippedIcon).length;
	const isHiding = document.body.classList.contains(hidingClass);
	toggle.hidden = count === 0;
	toggle.replaceChildren(
		isHiding ? <EyeIcon /> : <EyeClosedIcon />,
		` ${isHiding ? 'Show' : 'Hide'} ${count} skipped`,
	);
}

function refresh(): void {
	markSkippedInGraph();
	updateToggle();
}

function toggleHiding(): void {
	document.body.classList.toggle(hidingClass);
	refresh();
}

function addToggle(filterButton: HTMLElement): void {
	filterButton.before(
		<button
			type="button"
			className={cx(toggleClass, 'btn-link Link--muted f6 mr-2')}
			onClick={toggleHiding}
		/>,
	);
	updateToggle();
}

function init(signal: AbortSignal): void {
	abortableClassName(document.body, signal, hidingClass);

	// A job can become "skipped" any time that GitHub streams us a new status for it
	observe([sidebarSkippedIcon, graphSkippedIcon], batchedFunction(refresh, {delay: 100}), {signal});

	// The sidebar header is a React component. Wait for it to appear befoer adding  the filter.
	observe('[class^="ActionsRunJobsList-module__jobsHeader"] button:has(.octicon-filter)', addToggle, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isActionRun,
	],
	init,
});


/*

Test URLs

lots of skipped jobs to filter in/out
https://github.com/NousResearch/hermes-agent/actions/runs/36593454803

pick any run without skipped jobs, note the toggle doesn't appear
https://github.com/refined-github/refined-github/actions
*/
