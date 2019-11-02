import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {wrap} from '../libs/dom-utils';
import observeEl from '../libs/simplified-element-observer';

function linkifyLabels(activity: HTMLElement): void {
	const labels = select.all('.IssueLabel', activity);
	if (labels.length === 0) {
		return;
	}

	const repository = select('a[data-hovercard-type="repository"]', activity) as HTMLAnchorElement;
	if (!repository) {
		return;
	}

	for (const label of labels) {
		const search = new URLSearchParams();
		const text = (label.textContent || '').trim();
		search.set('q', `is:issue is:open sort:updated-desc label:"${text}"`);
		wrap(label, <a href={`${repository.href}/issues?${search}`} />);
	}
}

function findActivities(): void {
	const container = select('.js-recent-activity-container:not(.rgh-linkified-labels)');
	if (!container) {
		return;
	}

	container.classList.add('rgh-linkified-labels');
	for (const activity of select.all('.Box-row', container)) {
		linkifyLabels(activity);
	}
}

function init(): void {
	observeEl('#dashboard .news', findActivities);
}

features.add({
	id: __featureName__,
	description: 'Add links to labels in recent activities.',
	screenshot: false,
	include: [features.isDashboard],
	load: features.onDomReady,
	init
});
