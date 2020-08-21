import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import {observe, Observer} from 'selector-observer';

import features from '.';
import {observeOneMutation} from '../helpers/simplified-element-observer';

let observer: Observer;

async function loadDeferred(jumpList: Element): Promise<void> {
	// This event will trigger the loading, but if run too early, GitHub might not have attached the listener yet, so we try multiple times.
	const retrier = setInterval(() => {
		jumpList.parentElement!.dispatchEvent(new MouseEvent('mouseover'));
	}, 100);
	await observeOneMutation(jumpList);
	clearInterval(retrier);
}

async function init(): Promise<void> {
	const fileList = await elementReady([
		'.toc-select details-menu', // `isPR`
		'.toc-diff-stats + .content' // `isSingleCommit`
	].join());
	if (pageDetect.isPR()) {
		await loadDeferred(fileList!);
	}

	observer = observe('.file-info [href]:not(.rgh-pr-file-state)', {
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
	init,
	deinit: () => observer.abort(),
	waitForDomReady: false
});
