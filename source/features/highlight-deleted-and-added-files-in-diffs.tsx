import select from 'select-dom';
import oneTime from 'onetime';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {observeOneMutation} from '../helpers/simplified-element-observer';

async function loadDeferred(jumpList: Element): Promise<void> {
	const loadJumpList = (jumpList: Element) => jumpList.parentElement!.dispatchEvent(new MouseEvent('mouseover'));
	loadJumpList(jumpList);
	// The event listener might not have been attached yet, so we can try twice
	setTimeout(loadJumpList, 1000, jumpList);
	await observeOneMutation(jumpList);
}

async function init(): Promise<void> {
	const fileList = await elementReady([
		'.toc-select details-menu', // `isPR`
		'.toc-diff-stats + .content' // `isSingleCommit`
	].join());
	if (pageDetect.isPR()) {
		await loadDeferred(fileList!);
	}

	observe('.file-info [href]:not(.rgh-pr-file-state)', {
		constructor: HTMLAnchorElement,
		add(element) {
			element.classList.add('rgh-pr-file-state');
			const icon = (
				select(`[href="${element.hash}"] svg`, fileList) ?? // `isPR`
				select(`svg + [href="${element.hash}"]`, fileList)?.previousElementSibling! // `isSingleCommit`
			).cloneNode(true);
			const iconTitle = icon.getAttribute('title')!;
			if (iconTitle === 'added') {
				icon.classList.add('text-green');
			} else if (iconTitle === 'removed') {
				icon.classList.add('text-red');
			} else {
				return;
			}

			icon.classList.remove('select-menu-item-icon');
			icon.classList.add('d-inline-block', 'mx-1');
			element.before(icon);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Shows whether files in PRs are being added or removed.',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89845522-b93cfa00-db4c-11ea-8e09-ee73fca20a9c.png'
}, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isPRCommit404
	],
	init: oneTime(init),
	waitForDomReady: false
});
