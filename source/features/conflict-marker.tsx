import './conflict-marker.css';
import React from 'dom-chef';
import select from 'select-dom';
import AlertIcon from 'octicon/alert.svg';
import * as api from '../libs/api';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

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

function getPRConfig(prIcon: Element): PRConfig {
	const link = prIcon.closest('.js-navigation-item')!.querySelector<HTMLAnchorElement>('.js-navigation-open')!;
	const [, user, repo, , number] = link.pathname.split('/');
	return {
		user,
		repo,
		number,
		link,
		key: api.escapeKey(`${user}_${repo}_${number}`)
	};
}

async function init(): Promise<false | void> {
	const openPrIcons = select.all('.js-issue-row .octicon-git-pull-request.open');
	if (openPrIcons.length === 0) {
		return false;
	}

	const prs = openPrIcons.map(getPRConfig);
	const data = await api.v4(buildQuery(prs));

	for (const pr of prs) {
		if (data[pr.key].pullRequest.mergeable === 'CONFLICTING') {
			pr.link.after(
				<a
					className="rgh-conflict-marker tooltipped tooltipped-n m-0 text-gray mr-1"
					aria-label="This PR has conflicts that must be resolved"
					href={`${pr.link.pathname}#partial-pull-merging`}
				>
					<AlertIcon/>
				</a>
			);
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Shows which PRs have conflicts in PR lists',
	screenshot:
		'https://user-images.githubusercontent.com/9092510/62777551-2affe500-baae-11e9-8ba4-67f078347913.png'
}, {
	include: [
		pageDetect.isDiscussionList
	],
	init
});
