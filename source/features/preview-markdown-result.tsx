import './preview-markdown-result.css';
import React from 'dom-chef';
import delegate from 'delegate-it';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';

function togglePreviewResult({delegateTarget: target}: delegate.Event<MouseEvent, HTMLButtonElement>): void {
	document.body.classList.toggle('rgh-preview-markdown-result');
	target.classList.add('selected');
	(target.previousElementSibling ?? target.nextElementSibling)!.classList.remove('selected');
}

async function init(): Promise<void> {
	(await elementReady('.file-header'))!.append(
		<div className="BtnGroup px-3 pr-md-6 px-lg-2 rgh-preview-toggle">
			<button className="btn btn-sm BtnGroup-item rgh-preview-button selected" type="button">View diff</button>
			<button className="btn btn-sm BtnGroup-item rgh-preview-button" type="button">View final result</button>
		</div>
	);
	delegate(document, '.rgh-preview-button:not(.selected)', 'click', togglePreviewResult);
}

void features.add(__filebasename, {
	include: [
		() => pageDetect.isEditingFile() && location.pathname.endsWith('.md')
	],
	awaitDomReady: false,
	init
});
