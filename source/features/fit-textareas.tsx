import './fit-textareas.css';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import {isSafari} from 'webext-detect-page';
import fitTextarea from 'fit-textarea';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import onPrMergePanelOpen from '../github-events/on-pr-merge-panel-open';

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

function focusListener({delegateTarget: textarea}: DelegateEvent<Event, HTMLTextAreaElement>): void {
	watchTextarea(textarea);
}

function fitPrCommitMessageBox(): void {
	watchTextarea(select('textarea[name="commit_message"]')!);
}

function init(signal: AbortSignal): void {
	// Exclude PR review box because it's in a `position:fixed` container; The scroll HAS to appear within the fixed element.
	delegate(document, 'textarea:not(#pull_request_review_body)', 'focusin', focusListener, {signal});

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
	awaitDomReady: true, // TODO: Probably doesn't have to
	init,
}, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		isSafari,
	],
	additionalListeners: [
		onPrMergePanelOpen,
	],
	onlyAdditionalListeners: true,
	init: fitPrCommitMessageBox,
});
