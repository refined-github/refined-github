import select from 'select-dom';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {observeOneMutation} from '../helpers/simplified-element-observer';

function loadJumpList(jumpList: Element): void {
	jumpList.parentElement!.dispatchEvent(new MouseEvent('mouseover'));
}

async function init(): Promise<false | void> {
	const jumpList = await elementReady('details.toc-select details-menu')!;
	loadJumpList(jumpList!);
	setTimeout(loadJumpList, 1000, jumpList!);
	await observeOneMutation(jumpList!);

	observe('.file-info [href]', {
		constructor: HTMLAnchorElement,
		add(element) {
			const icon = select(`[href="${element.hash}"] svg`, jumpList)!.cloneNode(true);
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
	description: '',
	screenshot: ''
}, {
	include: [
		pageDetect.isPRFiles

	],
	init,
	waitForDomReady: false,
	repeatOnAjax: false
});
