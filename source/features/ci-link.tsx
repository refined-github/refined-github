import './ci-link.css';
import select from 'select-dom';
import onetime from 'onetime';
import features from '../libs/features';
import {appendBefore} from '../libs/dom-utils';
import {getRepoURL} from '../libs/utils';
import fetchDom from '../libs/fetch-dom';
import {isDefaultBranch} from '../libs/get-default-branch';

export const getIcon = onetime(async (): Promise<HTMLElement | void> => {
	// Copy icon from the current page if it's already the same
	const document_ = await isDefaultBranch() ? document : await fetchDom(`/${getRepoURL()}/commits`);
	const icon = select('.commit-build-statuses', document_);

	if (icon) {
		const iconCopy = icon.cloneNode(true);
		iconCopy.classList.add('rgh-ci-link');
		return iconCopy;
	}
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
	load: features.onAjaxedPages,
	init
});
