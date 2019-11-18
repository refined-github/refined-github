import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import {wrap} from '../libs/dom-utils';

async function init(): Promise<void> {
	const container = await elementReady('.js-recent-activity-container', {
		stopOnDomReady: false
	});

	for (const activity of select.all('li', container)) {
		const isPR = select.exists('.octicon-git-pull-request', activity);
		const repository = select<HTMLAnchorElement>('a[data-hovercard-type="repository"]', activity)!;
		for (const label of select.all('.IssueLabel', activity)) {
			const search = new URLSearchParams();
			const labelName = label.textContent!.trim();
			search.set('q', `is:${isPR ? 'pr' : 'issue'} is:open sort:updated-desc label:"${labelName}"`);
			wrap(label, <a href={`${repository.href}/${isPR ? 'pulls' : 'issues'}?${search}`} />);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Makes labels clickable in the dashboard’s "Recent activity" box.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/69045444-6ef97300-0a29-11ea-99a3-9a622c395709.png',
	include: [
		features.isDashboard
	],
	init
});
