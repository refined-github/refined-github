import './ci-link.css';
import onetime from 'onetime';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import {getRepoURL, getRepoBranch} from '../libs/utils';
import fetchDom from '../libs/fetch-dom';

export const fetchCIStatus = onetime(async () => {
	const url = `/${getRepoURL()}/commits/${getRepoBranch() || ''}`;
	const icon = await fetchDom<HTMLElement>(url, '.commit-build-statuses');

	if (!icon) {
		return undefined;
	}

	icon.classList.add('rgh-ci-link');
	return icon;
});

async function init(): Promise<false | void> {
	const icon = await fetchCIStatus();
	if (!icon) {
		return false;
	}

	if (onetime.callCount(fetchCIStatus) > 1) {
		icon.style.animation = 'none';
	}

	// Append to title (aware of forks and private repos)
	appendBefore('.pagehead h1', '.fork-flag', icon);
}

features.add({
	id: __featureName__,
	description: 'Add build status and link to CI after the repo’s title.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/32562120-d65166e4-c4e8-11e7-90fb-cbaf36e2709f.png',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
