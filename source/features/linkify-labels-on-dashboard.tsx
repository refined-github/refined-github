import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {wrap} from '../libs/dom-utils';

async function init(): Promise<void> {
	for (const label of select.all('.js-recent-activity-container :not(a) > .IssueLabel')) {
		const activity = label.closest('li')!;
		const isPR = select.exists('.octicon-git-pull-request', activity);
		const repository = select<HTMLAnchorElement>('a[data-hovercard-type="repository"]', activity)!;
		const url = new URL(`${repository.href}/${isPR ? 'pulls' : 'issues'}`);
		const labelName = label.textContent!.trim();
		url.searchParams.set('q', `is:${isPR ? 'pr' : 'issue'} is:open sort:updated-desc label:"${labelName}"`);
		wrap(label, <a href={String(url)}/>);
	}
}

features.add({
	id: __featureName__,
	description: 'Makes labels clickable in the dashboard’s "Recent activity" box.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/69045444-6ef97300-0a29-11ea-99a3-9a622c395709.png'
}, {
	include: [
		features.isDashboard
	],
	onlyAdditionalListeners: true,
	repeatOnAjax: false,
	init
});
