import './ci-link.css';
import onetime from 'onetime';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import {getRepoURL} from '../libs/utils';
import {appendBefore} from '../libs/dom-utils';

export const getIcon = onetime(async (): Promise<HTMLElement | undefined> => {
	return fetchDom(`/${getRepoURL()}/commits`, '.commit-build-statuses');
});

async function init(): Promise<false | void> {
	const icon = await getIcon();
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link');
	if (onetime.callCount(getIcon) > 1) {
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
	load: features.nowAndOnAjaxedPages,
	init
});
