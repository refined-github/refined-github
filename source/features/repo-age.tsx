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

const getOldestCommitDetails = cache.function(async (): Promise<string | void> => {
	const commitsCount = Number(select('li.commits .num')!.textContent!.replace(',', ''));
	const lastCommitHash = select<HTMLAnchorElement>('.commit-tease-sha')!.href.split('/').pop();

	if (!commitsCount || !lastCommitHash) {
		return;
	}

	const oldestCommit = await fetchDom(
		`${getCleanPathname()}/commits?after=${lastCommitHash}+${commitsCount - 2}`, 'ol:last-child > li.commits-list-item'
	);

	return JSON.stringify({
		link: select<HTMLAnchorElement>('.commit-title [href*="/commit/"]', oldestCommit)!.href,
		datetime: select('relative-time', oldestCommit)!.getAttribute('datetime')
	});
}, {
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const details = await getOldestCommitDetails();

	if (!details) {
		return;
	}

	const {link, datetime} = JSON.parse(details);

	const date = new Date(datetime);

	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
		.replace('just now', '1 second')
		.replace(/^an?/, '1')
		.split(' ');

	const element = (
		<li className="text-gray" title={`Repository created on ${dateFormatter.format(date)}`}>
			<a href={link}>
				{repoIcon()} <span className="num text-emphasized">{value}</span> {unit} old
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
