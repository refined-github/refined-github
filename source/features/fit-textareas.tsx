import './fit-textareas.css';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import fitTextarea from 'fit-textarea';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

function enable(textarea: HTMLTextAreaElement): void {
	// `fit-textarea` adds only once listener
	fitTextarea.watch(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}

function focusListener({delegateTarget: textarea}: DelegateEvent<Event, HTMLTextAreaElement>): void {
	enable(textarea);
}

function fitPrCommitMessageBox(): void {
	enable(select<HTMLTextAreaElement>('[name="commit_message"]')!);
}

function init(): void {
	// Exclude PR review box because it's in a `position:fixed` container; The scroll HAS to appear within the fixed element.
	delegate('textarea:not(#pull_request_review_body)', 'focusin', focusListener);
}

features.add({
	id: __featureName__,
	description: 'Auto-resizes comment fields to fit their content and no longer show scroll bars, rather than have a height limit like GitHub’s native "fit to content" behavior.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54336211-66fd5e00-4666-11e9-9c5e-111fccab004d.gif',
	init
});

features.add({
	id: __featureName__,
	description: false,
	screenshot: false,
	include: [
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init: () => {
		onPrMergePanelOpen(fitPrCommitMessageBox);
	}
});
