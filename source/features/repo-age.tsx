import twas from 'twas';
import cache from 'webext-storage-cache';
import React from 'dom-chef';
import select from 'select-dom';
import RepoIcon from 'octicon/repo.svg';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {getRepoURL, looseParseInt} from '../github-helpers';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

const getFirstCommit = cache.function(async (): Promise<[string, number, string] | undefined> => {
	const commitInfo = await elementReady<HTMLAnchorElement | HTMLScriptElement>('a.commit-tease-sha, include-fragment.commit-tease');
	const commitUrl = commitInfo instanceof HTMLAnchorElement ? commitInfo.href : commitInfo!.src;
	const commitSha = commitUrl.split('/').pop()!;

	const commitsCount = looseParseInt(select('li.commits .num')!.textContent!);

	// Returning undefined will make sure that it is not cached. It will check again for commits on the next load.
	// Reference: https://github.com/fregante/webext-storage-cache/#getter
	if (commitsCount === 0) {
		return;
	}

	if (commitsCount === 1) {
		const timeStamp = new Date(select('.commit-tease-sha + span relative-time')!.attributes.datetime.value);
		return [dateFormatter.format(timeStamp), timeStamp.getTime(), commitUrl];
	}

	const commit = await fetchDom(
		`${getRepoURL()}/commits?after=${commitSha}+${commitsCount - 2}`,
		'.commit'
	);
	const timeStamp = new Date(select('relative-time', commit)!.attributes.datetime.value);
	const {pathname} = select<HTMLAnchorElement>('a.message', commit)!;
	return [dateFormatter.format(timeStamp), timeStamp.getTime(), pathname];
}, {
	cacheKey: () => __filebasename + ':' + getRepoURL(),
	shouldRevalidate: value => typeof value === 'string' // TODO: Remove after June 2020
});

async function init(): Promise<void> {
	const [firstCommitDate, firstCommitTime, firstCommitUrl] = await getFirstCommit() ?? [];

	if (!firstCommitDate) {
		return;
	}

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(firstCommitTime!)
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	const element = (
		<li className="text-gray" title={`First commit dated ${firstCommitDate}`}>
			<a href={firstCommitUrl}>
				<RepoIcon/> <span className="num text-emphasized">{value}</span> {unit} old
			</a>
		</li>
	);

	await elementReady('.overall-summary + *');
	const license = select('.numbers-summary .octicon-law');
	if (license) {
		license.closest('li')!.before(element);
	} else {
		select('.numbers-summary')!.append(element);
	}
}

void features.add({
	id: __filebasename,
	description: 'Adds the age of the repository to the stats/numbers bar',
	screenshot: 'https://user-images.githubusercontent.com/3848317/69256318-95e6af00-0bb9-11ea-84c8-c6996d39da80.png'
}, {
	include: [
		pageDetect.isRepoRoot
	],
	waitForDomReady: false,
	init
});
