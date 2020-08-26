import './render-conversation-template.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import delay from 'delay';

import features from '.';
import {observeOneMutation} from '../helpers/simplified-element-observer';
import elementReady from 'element-ready';

async function init(): Promise<void | false> {
	// New MutationObserver(console.log).observe(select('.new_issue')!, {
	// 	childList: true,
	// 	subtree: true,
	// 	attributes: true,
	// 	attributeOldValue: true
	// })

	const template = select<HTMLTextAreaElement>('#issue_body')!.value;

	// if (!template.startsWith('<!-- Please follow the template -->')) {
	// 	return false;
	// }

	const previewTab = await elementReady<HTMLElement>('.js-preview-tab[aria-selected]', {
		stopOnDomReady: false,
		timeout: 1000 // If it takes longer than a second for this to appear, we can't expect the preview to appear in a timely manner either
	});

	const renderingContainer = select('.js-preview-body')!;
	await delay(100);
	previewTab!.click();
	await observeOneMutation(renderingContainer);

	select('.js-write-tab')!.click();
	window.scrollTo(0, 0); // Ugh...

	const rendering = renderingContainer.cloneNode(true);
	rendering.classList.remove('js-preview-body');
	rendering.classList.add('rgh-render-conversation-template');
	rendering.removeAttribute('style');
	select('markdown-toolbar')!.before(
		// Classes copied from .js-preview-body’s parents
		<div className="rgh-render-conversation-template mx-0 my-3 mx-md-2 mb-md-2">
			{rendering}
		</div>
	);
}

void features.add({
	id: __filebasename
}, {
	include: [
		pageDetect.isNewIssue // TODO: Enable on PR templates as well
	],
	init
});
