import React from 'dom-chef';
import select from 'select-dom';

import * as pageDetect from 'github-url-detection';

import features from '.';

async function addContributions(baseElement: HTMLElement): Promise<void> {
	const login = getCommenter(baseElement);
	if (!login) {
		return;
	}

	const contributorInfo = getContributorInfo(login);

	// Const access_token = await api.expectToken();
	const repo = contributorInfo.repoPath;

	const values = await getContributionsCountPosition(repo, login);
	console.log(values);

	const commitCount = values[0];
	// Const contributionsIndex = values[1] + 1;
	const contributionsIndex = Number.parseInt(values[1], 10) + 1;

	const issueCount = await getIssuePRCount(repo, login, 'issue');
	const prCount = await getIssuePRCount(repo, login, 'pr');

	const message = (
		<div data-view-component="true" className="d-flex flex-items-baseline f6 mt-1 color-text-secondary">
			Authored {commitCount} commits(#{contributionsIndex}), merged {prCount} PRs, opened {issueCount} issues
		</div>
	);
	const lastline = select.last('.js-hovercard-content .color-text-secondary');
	lastline!.after(message);
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

// https://api.github.com/search/issues?q=+author:fregante+repo:sindresorhus/refined-github+type:issue&order=asc&per_page=1&sort=created
// https://api.github.com/search/issues?q=+author:fregante+repo:sindresorhus/refined-github+type:pr   &order=asc&per_page=1&sort=created

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
