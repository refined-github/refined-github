import React from 'dom-chef';
import select from 'select-dom';
import cache from 'webext-storage-cache';
import * as api from '../libs/api';
import features from '../libs/features';
import {isForkedRepo} from '../libs/page-detect';
import * as pageDetect from '../libs/page-detect';
import pullRequestIcon from 'octicon/git-pull-request.svg';
import {getRepoURL, getRepoGQL} from '../libs/utils';

const getOpenPullRequests = cache.function(async (): Promise<AnyObject> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			refs(refPrefix: "refs/heads/", last: 100) {
				nodes {
					name
					associatedPullRequests(last: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
						nodes {
							number
							state
							url
						}
					}
				}
			}
		}
	`);
	const pullRequests = {};
	for (const branches of repository.refs.nodes) {
		if (branches.associatedPullRequests.nodes.length > 0) {
			pullRequests[branches.name] = branches.associatedPullRequests.nodes[0];
		}
	}

	return pullRequests;
}, {
	maxAge: 1,
	cacheKey: () => 'associatedBranchPullRequests:' + getRepoURL()
});

function capitalizeFirstLetter(string: string): string {
	return string[0].toUpperCase() + string.slice(1).toLowerCase();
}

const stateClass = {
	MERGED: 'purple',
	CLOSED: 'red',
	OPEN: 'green'
};

async function init(): Promise<void | false> {
	if (!isForkedRepo()) {
		return;
	}

	const branches = select.all('[branch]');

	const openPullRequests = await getOpenPullRequests();
	for (const branch of branches) {
		const prInfo = openPullRequests[branch.getAttribute('branch')!];
		if (prInfo) {
			const path = prInfo.url.replace(location.origin, '') as string;
			select('.test-compare-link', branch.parentElement!)!.replaceWith(
				<div className="d-inline-block text-right ml-3">
					<a href={path} className="muted-link" data-issue-and-pr-hovercards-enabled="" data-hovercard-type="pull_request" data-hovercard-url={path + '/hovercard'}>
						#{prInfo.number}
					</a>
					<a className={`State State--${stateClass[prInfo.state]} State--small ml-1 no-underline`} title={'Status: ' + capitalizeFirstLetter(prInfo.state)} href={path}>
						{pullRequestIcon()} {capitalizeFirstLetter(prInfo.state)}
					</a>
				</div>);
		}
	}
}

features.add({
	id: __filebasename,
	description: 'Shows the associated pull requests on branches for forked repository\'s',
	screenshot: 'https://user-images.githubusercontent.com/16872793/79803218-908bbd00-832f-11ea-89cd-fdd2aaea4a87.png'
}, {
	include: [
		pageDetect.isBranches
	],
	init
});
