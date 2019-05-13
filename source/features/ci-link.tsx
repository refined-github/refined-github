import './ci-link.css';
import onetime from 'onetime';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import {getRepoURL, getRepoBranch} from '../libs/utils';
import fetchDom from '../libs/fetch-dom';

const fetchStatus = onetime(async () => {
	const url = `/${getRepoURL()}/commits/${getRepoBranch() || ''}`;
	const icon = await fetchDom<HTMLElement>(url, '.commit-build-statuses');

	if (!icon) {
		return undefined;
	}

	icon.classList.add('rgh-ci-link');
	return icon;
});

async function init(): Promise<false | void> {
	const icon = await fetchStatus();
	if (!icon) {
		return false;
	}

	if (onetime.callCount(fetchStatus) > 1) {
		icon.style.animation = 'none';
	}

	// Append to title (aware of forks and private repos)
	appendBefore('.pagehead h1', '.fork-flag', icon);
}

features.add({
	id: 'ci-link',
	description: 'Add build status and link to CI after the repo’s title',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
