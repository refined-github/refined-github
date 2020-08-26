import './render-conversation-template.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import delay from 'delay';

import features from '.';
import {observeOneMutation} from '../helpers/simplified-element-observer';
import elementReady from 'element-ready';
import doma from 'doma';

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

	const body = new FormData();
	body.append("authenticity_token", select<HTMLInputElement>('.js-data-preview-url-csrf')!.value)
	body.append("text", template);
	const url = select('[data-preview-url]')!.dataset.previewUrl!;
	const response = await fetch(url, {body, method: 'post'});

	select('markdown-toolbar')!.before(
		<div className="rgh-render-conversation-template markdown-body m-3">
			{doma(await response.text())}
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
