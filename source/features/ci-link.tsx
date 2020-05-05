import './ci-link.css';
import oneTime from 'onetime';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import fetchDom from '../libs/fetch-dom';
import {getRepoURL} from '../libs/utils';
import {appendBefore} from '../libs/dom-utils';

// Look for the CI icon in the latest 2 days of commits #2990
export const getIcon = oneTime(fetchDom.bind(null,
	`/${getRepoURL()}/commits`,
	'.commit-group:nth-of-type(-n+2) .commit-build-statuses'
));

async function init(): Promise<false | void> {
	const icon = await getIcon() as HTMLElement | undefined;
	if (!icon) {
		return false;
	}

	icon.classList.add('rgh-ci-link');
	if (oneTime.callCount(getIcon) > 1) {
		icon.style.animation = 'none';
	}

	// Append to title (aware of forks and private repos)
	appendBefore('.pagehead h1', '.fork-flag', icon);
}

features.add({
	id: __filebasename,
	description: 'Add build status and link to CI after the repo’s title.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/32562120-d65166e4-c4e8-11e7-90fb-cbaf36e2709f.png'
}, {
	include: [
		pageDetect.isRepo
	],
	waitForDomReady: false,
	init
});
