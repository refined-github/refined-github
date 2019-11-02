import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import * as icons from '../libs/icons';

interface PRConfig {
	number: string;
	user: string;
	repo: string;
	link: HTMLAnchorElement;
	key: string;
}

function createQueryFragment(pr: PRConfig): string {
	return `
		${pr.key}: repository(owner: "${pr.user}", name: "${pr.repo}") {
			pullRequest(number: ${pr.number}) {
				mergeable
			}
		}
	`;
}

function buildQuery(prs: PRConfig[]): string {
	return prs.map(createQueryFragment).join('\n');
}

function getPRConfig(prLink: HTMLAnchorElement): PRConfig {
	const [, user, repo, , number] = prLink.pathname.split('/');
	return {
		user,
		repo,
		number,
		key: api.escapeKey(`${user}_${repo}_${number}`),
		link: prLink
	};
}

async function init(): Promise<false | void> {
	const prLinks = select.all<HTMLAnchorElement>('.js-issue-row .js-navigation-open');
	if (prLinks.length === 0) {
		return false;
	}

	const prs = prLinks.map(getPRConfig);
	const data = await api.v4(buildQuery(prs));

	for (const pr of prs) {
		if (data[pr.key].pullRequest.mergeable === 'CONFLICTING') {
			pr.link.after(
				<a
					className="tooltipped tooltipped-n m-0 text-gray mr-2"
					aria-label="This PR has conflicts that must be resolved"
					href={`${pr.link.pathname}#partial-pull-merging`}
				>
					{icons.alert()}
				</a>,
			);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Shows which PRs have conflicts in PR lists',
	screenshot:
		'https://user-images.githubusercontent.com/9092510/62777551-2affe500-baae-11e9-8ba4-67f078347913.png',
	include: [
		features.isPRList
	],
	load: features.onAjaxedPages,
	init
});
