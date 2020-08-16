import React from 'dom-chef';
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
		add(filename) {
			filename.classList.add('rgh-pr-file-state');
			const sourceIcon = pageDetect.isPR() ?
				select(`[href="${filename.hash}"] svg`, fileList)! :
				select(`svg + [href="${filename.hash}"]`, fileList)?.previousElementSibling!;
			const icon = sourceIcon.cloneNode(true);
			const action = icon.getAttribute('title')!;
			if (action === 'added') {
				icon.classList.add('text-green');
			} else if (action === 'removed') {
				icon.classList.add('text-red');
			} else {
				return;
			}

			icon.classList.remove('select-menu-item-icon');
			filename.parentElement!.append(
				<span className="tooltipped tooltipped-s" aria-label={'File ' + action}>
					{icon}
				</span>
			);
		}
	});
}

void features.add({
	id: __filebasename,
	description: 'Indicates with an icon whether files in commits and pull requests being added or removed.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/90332474-23262b00-dfb5-11ea-9a03-8fd676ea0fdd.png'
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
