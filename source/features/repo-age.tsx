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

type OldestCommitDetails = {
	url: string;
	datetime: string;
};

const getOldestCommitDetails = cache.function(async (): Promise<OldestCommitDetails | void> => {
	const commitsCount = Number(select('li.commits .num')!.textContent!.replace(',', ''));
	const lastCommitHash = select<HTMLAnchorElement>('.commit-tease-sha')!.href.split('/').pop();

	if (commitsCount === 0) {
		return;
	}

	const oldestCommit = await fetchDom(
		`${getCleanPathname()}/commits?after=${lastCommitHash!}+${commitsCount - 2}`, 'ol:last-child > li.commits-list-item'
	);

	return {
		url: select<HTMLAnchorElement>('.commit-title [href*="/commit/"]', oldestCommit)!.href,
		datetime: select('relative-time', oldestCommit)!.getAttribute('datetime')!
	};
}, {
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

const addRepoAgeItem = (element: Element): void => {
	const license = select('.numbers-summary .octicon-law');

	if (license) {
		license.closest('li')!.before(element);
	} else {
		select('.numbers-summary')!.append(element);
	}
};

async function init(): Promise<void> {
	const placeholder = (
		<li className="text-gray">
			{repoIcon()} <span className="text-emphasized js_repo_age_placeholder">Loading...</span>
		</li>
	);

	await elementReady('.overall-summary + *');

	addRepoAgeItem(placeholder);

	const details = await getOldestCommitDetails();

	if (!details) {
		select('.js_repo_age_placeholder', placeholder)!.textContent = '-';
		placeholder.title = 'Cannot determine repo age from the oldest commit';

		return;
	}

	// Older cached values are date strings so to handle it for the older
	// cached values we are checking for the type of the returned values.
	// This check is supposed to be dropped soon.
	let oldestCommitUrl;
	let repoCreationDate;

	if (typeof details === 'object') {
		oldestCommitUrl = details.url;
		repoCreationDate = details.datetime;
	} else {
		repoCreationDate = details;
	}

	const date = new Date(repoCreationDate);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	const repoAge = <>{repoIcon()} <span className="num text-emphasized">{value}</span> {unit} old</>;

	const element = (
		<li className="text-gray" title={`First commit dated ${dateFormatter.format(date)}`}>
			{/* commit url won't be present for the existing cached values */}
			{oldestCommitUrl ? <a href={oldestCommitUrl}>{repoAge}</a> : <>{repoAge}</>}
		</li>
	);

	placeholder.remove();
	addRepoAgeItem(element);
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
