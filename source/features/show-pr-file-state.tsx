import select from 'select-dom';
import oneTime from 'onetime';
import {observe} from 'selector-observer';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {observeOneMutation} from '../helpers/simplified-element-observer';

function loadJumpList(jumpList: Element): void {
	jumpList.parentElement!.dispatchEvent(new MouseEvent('mouseover'));
}

async function init(): Promise<void> {
	const jumpList = await elementReady('details.toc-select details-menu')!;
	loadJumpList(jumpList!);
	// The event listener might not have been attached yet, so we can try twice
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
	description: 'Show if a file was added or deleted on the pr file bar',
	screenshot: 'https://user-images.githubusercontent.com/16872793/89691560-3828fd00-d8d7-11ea-9107-ba7f9f4ec316.png'
}, {
	include: [
		pageDetect.isPRFiles
	],
	exclude: [
		pageDetect.isPRFile404
	],
	init: oneTime(init),
	waitForDomReady: false
});
