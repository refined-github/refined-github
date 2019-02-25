import select from 'select-dom';
import onetime from 'onetime';
import domify from '../libs/domify';
import features, { AsyncFeatureInit } from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import {getRepoURL, getRepoBranch} from '../libs/utils';

const fetchStatus = onetime(async () => {
	const url = `${location.origin}/${getRepoURL()}/commits/${getRepoBranch() || ''}`;
	const response = await fetch(url);
	const dom = domify(await response.text());

	const icon = select('.commit-build-statuses', dom)!;

	icon.classList.add('rgh-ci-link');
	return icon;
});

async function init(): AsyncFeatureInit {
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
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
