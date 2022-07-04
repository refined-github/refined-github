import React from 'dom-chef';
import select from 'select-dom';
import {observe} from 'selector-observer';
import oneMutation from 'one-mutation';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {onDiffFileLoad} from '../github-events/on-fragment-load';

async function loadDeferred(jumpList: Element): Promise<void> {
	// This event will trigger the loading, but if run too early, GitHub might not have attached the listener yet, so we try multiple times.
	const retrier = setInterval(() => {
		jumpList.parentElement!.dispatchEvent(new MouseEvent('mouseover'));
	}, 100);
	await oneMutation(jumpList, {childList: true, subtree: true});
	clearInterval(retrier);
}

function highlightFilename(filename: HTMLAnchorElement, sourceIcon: SVGSVGElement): void {
	filename.classList.add('rgh-pr-file-state');

	const icon = sourceIcon.cloneNode(true);
	const action = icon.getAttribute('title')!;
	if (action === 'added') {
		icon.classList.add('color-text-success', 'color-fg-success');
	} else if (action === 'removed') {
		icon.classList.add('color-text-danger', 'color-fg-danger');
	} else {
		return;
	}

	icon.classList.remove('select-menu-item-icon');
	filename.parentElement!.append(
		<span className="tooltipped tooltipped-s ml-1" aria-label={'File ' + action}>
			{icon}
		</span>,
	);
}

async function init(): Promise<Deinit> {
	const fileList = await elementReady([
		'.toc-select details-menu[src*="/show_toc?"]', // `isPR`
		'.toc-diff-stats + .content', // `isSingleCommit` and `isCompare`
	].join(','));

	if (pageDetect.isPR()) {
		await loadDeferred(fileList!);
	}

	// Link--primary excludes CODEOWNERS icon #5565
	return observe('.file-info .Link--primary:not(.rgh-pr-file-state)', {
		constructor: HTMLAnchorElement,
		add(filename) {
			const sourceIcon = pageDetect.isPR()
				? select(`[href="${filename.hash}"] svg`, fileList)!
				: select(`svg + [href="${filename.hash}"]`, fileList)?.previousElementSibling as SVGSVGElement;

			highlightFilename(filename, sourceIcon);
		},
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isCommit,
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isPRCommit404,
	],
	awaitDomReady: false,
	deduplicate: 'has-rgh-inner',
	init,
}, {
	include: [
		pageDetect.isCompare,
	],
	exclude: [
		() => select.exists('.blankslate:not(.blankslate-large)'),
	],
	additionalListeners: [
		onDiffFileLoad,
	],
	onlyAdditionalListeners: true,
	init,
});

/*

## Test URLs

PR: https://github.com/refined-github/refined-github/pull/5631/files
PR with CODEOWNERS: https://github.com/dotnet/winforms/pull/6028/files

*/
