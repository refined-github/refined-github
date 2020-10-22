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

async function init(): Promise<void | false> {
	const fileList = await elementReady([
		'.toc-select details-menu', // `isPR`
		'.toc-diff-stats + .content' // `isSingleCommit` and `isCompare`
	].join());

	// The file list does not exist if the diff is too large
	if (pageDetect.isCompare() && !fileList) {
		return false;
	}

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

void features.add(__filebasename, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
		pageDetect.isCompare
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isPRCommit404
	],
	init,
	deinit: () => observer.abort(),
	awaitDomReady: false
});
