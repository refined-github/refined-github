import './hide-markdown-diff.css';
import React from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {isSingleMarkdownFile} from '../github-helpers';

// Fix missing indentation in changed quote blocks #4035
function fixMissingIndentation(): void {
	for (const changedBlockquote of select.all('.show-preview .changed > .changed_tag[data-before-tag="blockquote"]')) {
		changedBlockquote.parentElement!.classList.add('ml-3');
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
	// Watch for when the content in the "Preview" tab has finished loading
	new MutationObserver(fixMissingIndentation).observe((await elementReady('.js-code-editor'))!, {attributeFilter: ['class']});
}

void features.add(__filebasename, {
	include: [
		() => pageDetect.isEditingFile() && isSingleMarkdownFile()
	],
	awaitDomReady: false,
	init
});
