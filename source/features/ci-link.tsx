import './ci-link.css';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {buildRepoURL} from '../github-helpers';

// Look for the CI icon in the latest 2 days of commits #2990
const getIcon = onetime(async () => fetchDom(
	buildRepoURL('commits'), [
		'.TimelineItem--condensed:nth-of-type(-n+2) .commit-build-statuses', // TODO[2022-04-29]: GHE #4294
		'.TimelineItem--condensed:nth-of-type(-n+2) batch-deferred-content[data-url$="checks-statuses-rollups"]',
	].join(','),
));

async function init(): Promise<false | void> {
	const icon = await getIcon();
	if (!icon) {
		return false;
	}

	// Append to title (aware of forks and private repos)
	const repoNameHeader = select('[itemprop="name"]')!.parentElement!;
	repoNameHeader.append(icon);
	repoNameHeader.classList.add('rgh-ci-link');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isEmptyRepo,
	],
	awaitDomReady: false,
	init,
});
