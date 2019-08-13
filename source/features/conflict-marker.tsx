import select from 'select-dom';
import React from 'dom-chef';
import * as api from '../libs/api';
import {getOwnerAndRepo, getRepoURL} from '../libs/utils';
import features from '../libs/features';
import {alert} from '../libs/icons';

interface PRConfig {
	id: string;
	owner: string;
	name: string;
}

function getPrNumber(pr: string): string {
	return pr.split('_')[1];
}

function createQueryFragment(pr: PRConfig): string {
	return `
		${api.escapeKey(pr.id)}: repository(owner: "${pr.owner}", name: "${pr.name}") {
			pullRequest(number: ${getPrNumber(pr.id)}) {
				mergeable
			}
		}
	`;
}

function buildQuery(
	prs: PRConfig[]
): string {
	return prs.map(createQueryFragment).join('\n');
}

function getPRConfig(element: HTMLElement): PRConfig {
	try {
		const prTitle = select('a[data-hovercard-type="repository"]', element)!.textContent!;
		const [owner, name] = prTitle.trim().split('/');

		return {
			id: element.id,
			owner,
			name
		};
	} catch (error) {
		const {ownerName, repoName} = getOwnerAndRepo();

		return {
			id: element.id,
			owner: ownerName,
			name: repoName
		};
	}
}

async function init(): Promise<false | void> {
	const elements = select.all('.js-issue-row');
	if (elements.length === 0) {
		return false;
	}

	const prs = elements.map(getPRConfig);

	const query = buildQuery(prs);
	const data = await api.v4(query);

	for (const pr of elements) {
		if (data[api.escapeKey(pr.id)].pullRequest.mergeable === 'CONFLICTING') {
			select('.d-inline-block.mr-1', pr)!.insertAdjacentElement('afterbegin',
				<a
					className="tooltipped tooltipped-n m-0 text-gray mr-2"
					aria-label="This PR has conflicts that must be resolved"
					href={`/${getRepoURL()}/pull/${getPrNumber(pr.id)}#partial-pull-merging`}
				>
					{alert()}
				</a>
			);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Shows which PRs have conflicts in PR lists',
	screenshot: 'https://user-images.githubusercontent.com/9092510/62777551-2affe500-baae-11e9-8ba4-67f078347913.png',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
