import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import * as icons from '../libs/icons';

export async function mergeBranches(repoUrl: string, base: string, head: string) {
	const result = await api.v3(`repos/${repoUrl}/merges`, {
		method: 'POST',
		body: {base, head}
	});

	return result.status >= 200 && result.status < 300;
}

async function handler(base: string, head: string, button: HTMLButtonElement) {
	button.disabled = true;
	button.textContent = 'Updating branch…';

	const [, repoUrl = ''] = location.pathname.match(/\/([^/]+\/[^/]+)/)!;

	if (await mergeBranches(repoUrl, base, head)) {
		button.closest('.branch-action-item')!.remove();
	}
}

async function init(): Promise<false | void> {
	if (select.exists('.rgh-update-pr-from-master')) {
		return;
	}

	const prBase = select('.base-ref')!.textContent!;
	const prHead = select('.head-ref')!.textContent!;
	if (prBase.includes(':')) {
		return false;
	}

	select('.mergeability-details .merge-message')!.before(
		<div className="branch-action-item">
			<div className="branch-action-btn float-right js-immediate-updates js-tryable-again js-needs-timeline-marker-header">
				<button type="button" className="btn rgh-update-pr-from-master" onClick={event => handler(prHead, prBase, event.currentTarget)}>
					Update branch
				</button>
			</div>
			<div className="branch-action-item-icon completeness-indicator completeness-indicator-problem">
				{icons.alert()}
			</div>
			<h3 className="h4 status-heading">
				Merge the latest changes from <span className="branch-name">{prBase}</span> into this branch.
			</h3>
		</div>
	);
}

features.add({
	id: 'update-pr-from-master',
	include: [
		features.isPRConversation
	],
	load: features.onNewComments,
	init
});
