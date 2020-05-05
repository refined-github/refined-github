import './fit-textareas.css';
import select from 'select-dom';
import fitTextarea from 'fit-textarea';
import delegate from 'delegate-it';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

function inputListener(event: Event): void {
	fitTextarea(event.target as HTMLTextAreaElement);
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
	watchTextarea(select<HTMLTextAreaElement>('[name="commit_message"]')!);
}

function init(): void {
	// Exclude PR review box because it's in a `position:fixed` container; The scroll HAS to appear within the fixed element.
	delegate(document, 'textarea:not(#pull_request_review_body)', 'focusin', focusListener);

	select.all('textarea').forEach(watchTextarea);
}

features.add({
	id: __filebasename,
	description: 'Auto-resizes comment fields to fit their content and no longer show scroll bars, rather than have a height limit like GitHub’s native "fit to content" behavior.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54336211-66fd5e00-4666-11e9-9c5e-111fccab004d.gif'
}, {
	init
}, {
	include: [
		pageDetect.isPRConversation
	],
	init: () => {
		onPrMergePanelOpen(fitPrCommitMessageBox);
	}
});
