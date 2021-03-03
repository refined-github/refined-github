import './hide-markdown-diff.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

// Fix duplicated content in changed quote blocks #4035
function fixDuplicatedContent(): void {
	if (!select.exists('.js-code-editor.show-preview')) {
		return;
	}

	for (const possibleDuplicate of select.all('.markdown-body .changed > .changed_tag[data-before-tag="blockquote"] + p')) {
		// Content is duplicated if already present in a sibling <ins> element
		if (possibleDuplicate.textContent && select('ins', possibleDuplicate.parentElement!)?.textContent?.includes(possibleDuplicate.textContent)) {
			possibleDuplicate.classList.add('removed');
		}
	}
}

function togglePreviewResult({delegateTarget: target}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	document.body.classList.toggle('rgh-hide-markdown-diff', target.value === 'enable');
	target.classList.add('selected');
	(target.previousElementSibling ?? target.nextElementSibling)!.classList.remove('selected');
}

async function init(): Promise<void> {
	(await elementReady('.file-header'))!.append(
		<div className="BtnGroup px-3 pr-md-6 px-lg-2 rgh-preview-toggle">
			<button className="btn btn-sm BtnGroup-item rgh-preview-button selected" type="button" value="disable">View diff</button>
			<button className="btn btn-sm BtnGroup-item rgh-preview-button" type="button" value="enable">View final result</button>
		</div>
	);
	delegate(document, '.rgh-preview-button:not(.selected)', 'click', togglePreviewResult);
	new MutationObserver(fixDuplicatedContent).observe((await elementReady('.js-code-editor'))!, {attributeFilter: ['class']});
}

void features.add(__filebasename, {
	include: [
		() => pageDetect.isEditingFile() && location.pathname.endsWith('.md')
	],
	awaitDomReady: false,
	init
});
