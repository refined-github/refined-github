import twas from 'twas';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import repoIcon from 'octicon/repo.svg';
import elementReady from 'element-ready';
import fetchDom from '../libs/fetch-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/utils';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
	year: 'numeric',
	month: 'long',
	day: 'numeric'
});

type OldestCommitDetails = {
	url: string;
	datetime: string;
};

const getOldestCommitDetails = cache.function(async (): Promise<OldestCommitDetails | false> => {
	const lastCommitHash = (await elementReady<HTMLAnchorElement>('.commit-tease-sha', {stopOnDomReady: false}))!.href.split('/').pop()!;
	const commitsCount = Number(select('li.commits .num')!.textContent!.replace(',', ''));

	if (commitsCount === 0) {
		return false;
	}

	if (commitsCount === 1) {
		return {
			url: `/${getRepoURL()}/commit/${lastCommitHash}`,
			datetime: select('.commit-tease-sha + span relative-time')!.getAttribute('datetime')!
		};
	}

	const oldestCommit = await fetchDom(
		`${getRepoURL()}/commits?after=${lastCommitHash}+${commitsCount - 2}`, 'ol:last-child > li.commits-list-item'
	);

	return {
		url: select<HTMLAnchorElement>('.commit-title [href*="/commit/"]', oldestCommit)!.href,
		datetime: select('relative-time', oldestCommit)!.getAttribute('datetime')!
	};
}, {
	isExpired: (cachedValue: OldestCommitDetails | false | string) => !cachedValue || typeof cachedValue === 'string',
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const detailsPromise = getOldestCommitDetails();

	const placeholder = (
		<li className="text-gray">
			{repoIcon()} <span className="text-emphasized">Loading...</span>
		</li>
	);

	await elementReady('.overall-summary + *');
	const license = select('.numbers-summary .octicon-law');
	if (license) {
		license.closest('li')!.before(placeholder);
	} else {
		select('.numbers-summary')!.append(placeholder);
	}

	const details = await detailsPromise;

	if (!details) {
		select('span', placeholder)!.textContent = '-';
		placeholder.title = 'Cannot determine repo age from the oldest commit';

		return;
	}

	const date = new Date(details.datetime);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	placeholder.title = `First commit dated ${dateFormatter.format(date)}`;
	placeholder.textContent = '';
	placeholder.append(<a href={details.url}>{repoIcon()} <span className="num text-emphasized">{value}</span> {unit} old</a>);
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
