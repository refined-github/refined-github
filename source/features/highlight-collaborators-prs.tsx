import './highlight-collaborators-prs.css';
import select from 'select-dom';
import features from '../libs/features';
import * as api from '../libs/api';
import {getRepoGQL} from '../libs/utils';

function buildQuery(): string {
	return `
		repository(${getRepoGQL()}) {
			collaborators(first: 100) {
				nodes { login }
			}
		}
	`;
}

async function init(): Promise<false | void> {
	if (!features.isRepoWithAccess()) {
		return false;
	}

	const authors = select.all('.js-issue-row [data-hovercard-type="user"]');
	if (authors.length === 0) {
		return false;
	}

	const data = await api.v4(buildQuery());
	const collaborators = data.repository.collaborators.nodes.map((node: AnyObject) => node.login);

	for (const author of authors) {
		if (collaborators.includes(author.textContent!.trim())) {
			author.classList.add('rgh-collaborator');
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Highlights PRs opened by organization collaborators.',
	screenshot: '',
	load: features.onAjaxedPages,
	include: [
		features.isPRList
	],
	init
});
