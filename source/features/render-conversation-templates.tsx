import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	const template = select<HTMLTextAreaElement>('#issue_body')!.value;
	const body = new FormData();
	body.append("authenticity_token", select<HTMLInputElement>('.js-data-preview-url-csrf')!.value)
	body.append("text", template);
	const url = select('[data-preview-url]')!.dataset.previewUrl!;
	const response = await fetch(url, {
		method: 'post',
		body
	});
	const renderedText = await response.text();
	select('markdown-toolbar')!.prepend(<>);
}

void features.add({
	id: __filebasename
}, {
	include: [
		pageDetect.isNewIssue // TODO: Enable on PR templates as well
	],
	init
});
