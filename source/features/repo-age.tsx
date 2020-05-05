import twas from 'twas';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import RepoIcon from 'octicon/repo.svg';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import fetchDom from '../libs/fetch-dom';
import {getRepoURL, looseParseInt} from '../libs/utils';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

const getFirstCommitDate = cache.function(async (): Promise<string | undefined> => {
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
		return select('.commit-tease-sha + span relative-time')!.attributes.datetime.value;
	}

	const relativeTime = await fetchDom(
		`${getRepoURL()}/commits?after=${commitSha}+${commitsCount - 2}`,
		'.commit-meta relative-time'
	);

	return relativeTime!.attributes.datetime.value;
}, {
	cacheKey: () => __filebasename + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const firstCommitDate = await getFirstCommitDate();

	if (!firstCommitDate) {
		return;
	}

	const date = new Date(firstCommitDate);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	const element = (
		<li className="text-gray" title={`First commit dated ${dateFormatter.format(date)}`}>
			<RepoIcon/> <span className="num text-emphasized">{value}</span> {unit} old
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

features.add({
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
