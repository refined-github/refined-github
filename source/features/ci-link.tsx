import './ci-link.css';
import select from 'select-dom';
import onetime from 'onetime';
import elementReady from 'element-ready';
import features from '../libs/features';
import fetchDom from '../libs/fetch-dom';
import oneEvent from '../libs/one-event';
import {getRepoURL} from '../libs/utils';
import {isRepoRoot} from '../libs/page-detect';
import {appendBefore} from '../libs/dom-utils';

export const getIcon = onetime(async (): Promise<HTMLElement | null> => {
	let document_: ParentNode = document;
	if (isRepoRoot()) {
		// The icon is loaded by GitHub via AJAX. If there's no loader, either it already loaded or there's no icon
		const loader = await elementReady('.commit-tease include-fragment[href$="/rollup"]');
		if (loader) {
			await oneEvent(loader, 'load');
		}
	} else {
		document_ = await fetchDom(`/${getRepoURL()}/commits`);
	}

	const icon = select('.commit-build-statuses', document_);
	icon?.classList.add('rgh-ci-link');
	return icon;
});

async function init(): Promise<false | void> {
	const icon = await getIcon();
	if (!icon) {
		return false;
	}

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
