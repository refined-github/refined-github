import React from 'dom-chef';
import select from 'select-dom';
import {CodeIcon} from '@primer/octicons-react';

import * as pageDetect from 'github-url-detection';

import features from '.';

async function addContributions(baseElement: HTMLElement): Promise<void> {
	const login = getCommenter(baseElement);
	if (!login) {
		return;
	}

	const placeholder = <span data-view-component="true" className="lh-condensed">Retrieving stats…</span>;
	const container = (
		<div data-view-component="true" className="d-flex flex-items-baseline f6 mt-1 color-text-secondary">
			<div data-view-component="true" className="mr-1 flex-shrink-0">
				<CodeIcon/>
			</div>
			{placeholder}
		</div>
	);

	let lastline = select.last('.js-hovercard-content .color-text-secondary');
	lastline!.after(container);

	const contributorInfo = getContributorInfo(login);

	const repo = contributorInfo.repoPath;

	const values = await getContributionsCountPosition(repo, login);
	console.log(values);

	const commitCount: string = values[0];
	// Const contributionsOrder = values[1] + 1;
	const contributionsOrder = Number.parseInt(values[1], 10) + 1;

	const issueCount = await getIssuePRCount(repo, login, 'issue');
	const prCount = await getIssuePRCount(repo, login, 'pr');

	// Authored {commitCount} commits(#{contributionsOrder}), merged {prCount} PRs, opened {issueCount} issues
	const message = (Number.parseInt(commitCount, 10) > 0 ? `Authored ${commitCount} commits(#${contributionsOrder}), ` : '') + `merged ${prCount} PRs, opened ${issueCount} issues`;
	lastline = select.last('.js-hovercard-content .color-text-secondary span');
	lastline!.textContent = message;
}

async function getContributionsCountPosition(repoPath: string, login: string): Promise<any[]> {
	// Target: https://api.github.com/repos/sindresorhus/refined-github/contributors   (only the first 30 usernames)  --> This endpoint may return information that is a few hours old because the GitHub REST API v3 caches contributor data to improve performance.
	const URL = `https://api.github.com/repos/${repoPath}/contributors`;
	const response = await fetch(URL);
	const commits = await response.json();
	const isLogin = (element: any): boolean => element.login === login;
	if (commits.findIndex((element: any) => isLogin(element)) === -1) {
		return [0, 0];
	}

	const constributionsPosition = commits.findIndex((element: any) => isLogin(element));
	const commitCount = commits[constributionsPosition].contributions;

	return [commitCount, constributionsPosition];
}

const hovercardObserver = new MutationObserver(([mutation]) => {
	(async () => {
		await addContributions(mutation.target as HTMLElement);
	})();
});

function getCommenter(baseElement: HTMLElement): string | undefined {
	const login = select('a[data-octo-dimensions="link_type:profile"]', baseElement)?.pathname.slice(1);
	if (typeof login !== 'undefined') {
		return login;
	}

	return undefined;
}

function getContributorInfo(login: string): any {
	const pathNameArray = location.pathname.split('/');
	const org = pathNameArray[1];
	const repo = pathNameArray[2];
	const currentNumber = pathNameArray[4];
	const repoPath = org + '/' + repo;
	const contributor = login;

	const returnValue = {
		contributor,
		currentNum: currentNumber,
		repoPath,
	};

	return returnValue;
}

async function getIssuePRCount(repoPath: string, login: string, type: string): Promise<string> {
	const URL = `https://api.github.com/search/issues?q=+author:${login}+repo:${repoPath}+type:${type}&order=asc&per_page=1&sort=created`;

	const response = await fetch(URL);
	const result = await response.json();
	return result.total_count;
}

function init(): void {
	const hovercardContainer = select('.js-hovercard-content > .Popover-message');
	if (hovercardContainer) {
		hovercardObserver.observe(hovercardContainer, {childList: true});
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	init,
});
