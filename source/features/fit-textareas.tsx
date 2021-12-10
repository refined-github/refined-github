import './fit-textareas.css';
import select from 'select-dom';
import delegate from 'delegate-it';
import {isSafari} from 'webext-detect-page';
import fitTextarea from 'fit-textarea';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open.js';

function inputListener({target}: Event): void {
	fitTextarea(target as HTMLTextAreaElement);
}

function watchTextarea(textarea: HTMLTextAreaElement): void {
	textarea.addEventListener('input', inputListener); // The user triggers `input` event
	textarea.addEventListener('change', inputListener); // File uploads trigger `change` events
	fitTextarea(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}

function focusListener({delegateTarget: textarea}: delegate.Event<Event, HTMLTextAreaElement>): void {
	watchTextarea(textarea);
}

function fitPrCommitMessageBox(): void {
	watchTextarea(select('textarea[name="commit_message"]')!);
}

function init(): void {
	// Exclude PR review box because it's in a `position:fixed` container; The scroll HAS to appear within the fixed element.
	delegate(document, 'textarea:not(#pull_request_review_body)', 'focusin', focusListener);
	for (const textArea of select.all('textarea')) {
		watchTextarea(textArea);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	exclude: [
		isSafari,
	],
	init,
}, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		isSafari,
	],
	deduplicate: 'has-rgh-inner',
	init() {
		onPrMergePanelOpen(fitPrCommitMessageBox);
	},
});
