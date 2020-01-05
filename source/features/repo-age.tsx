import twas from 'twas';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import repoIcon from 'octicon/repo.svg';
import elementReady from 'element-ready';
import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';
import {getCleanPathname, getRepoURL} from '../libs/utils';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

const getRepoCreationDate = cache.function(async (): Promise<string> => {
	const commitsCount = Number(select('li.commits .num')!.textContent!.trim()!.replace(',', ''));
	const lastCommitHash = select('.commit-tease .commit-tease-sha')!.getAttribute('href')!.split('/').pop();

	if (!commitsCount || !lastCommitHash) {
		return Promise.reject(new Error('Cannot get commit count or last commit hash'));
	}

	const relativeTime = await fetchDom(
		`${getCleanPathname()}/commits?after=${lastCommitHash}+${commitsCount - 2}`, 'ol:last-child > li.commits-list-item relative-time'
	);

	return relativeTime!.getAttribute('datetime')!;
}, {
	expiration: Number.MAX_SAFE_INTEGER,
	cacheKey: () => __featureName__ + 'updated:' + getRepoURL() // Don't know how to update the existing cache so.
});

async function init(): Promise<void> {
	const date = new Date(await getRepoCreationDate());

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	const element = (
		<li className="text-gray" title={`Repository created on ${dateFormatter.format(date)}`}>
			{repoIcon()} <span className="num text-emphasized">{value}</span> {unit} old
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
	id: __featureName__,
	description: 'Adds the age of the repository to the stats/numbers bar',
	screenshot: 'https://user-images.githubusercontent.com/3848317/69256318-95e6af00-0bb9-11ea-84c8-c6996d39da80.png',
	include: [
		features.isRepoRoot
	],
	load: features.nowAndOnAjaxedPages,
	init
});
