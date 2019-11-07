import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import {wrap} from '../libs/dom-utils';

async function init(): Promise<void> {
	const container = await elementReady('.js-recent-activity-container', {
		stopOnDomReady: false
	});

	for (const activity of select.all('.Box-row', container)) {
		const repository = select<HTMLAnchorElement>('a[data-hovercard-type="repository"]', activity)!;
		for (const label of select.all('.IssueLabel', activity)) {
			const search = new URLSearchParams();
			const labelName = label.textContent!.trim();
			search.set('q', `is:issue is:open sort:updated-desc label:"${labelName}"`);
			wrap(label, <a href={`${repository.href}/issues?${search}`} />);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Makes labels clickable in the dashboard’s "Recent activity" box.',
	screenshot: false,
	include: [
		features.isDashboard
	],
	init
});
