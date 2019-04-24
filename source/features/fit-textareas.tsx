/*
Automatically expands textareas to fit ALL of their content, rather than have a height limit like GitHub's native "fit to content" behavior.
https://user-images.githubusercontent.com/1402241/54336211-66fd5e00-4666-11e9-9c5e-111fccab004d.gif
*/

import delegate, {DelegateEvent} from 'delegate-it';
import fitTextarea from 'fit-textarea';
import features from '../libs/features';

function listener({delegateTarget: textarea}: DelegateEvent<Event, HTMLTextAreaElement>): void {
	// `fit-textarea` adds only once listener
	fitTextarea.watch(textarea);

	// Disable constrained native feature
	textarea.classList.replace('js-size-to-fit', 'rgh-fit-textareas');
}

function init(): void {
	// Exclude PR review box because it's in a `position:fixed` container; The scroll has to appear within the fixed element.
	delegate('textarea:not(#pull_request_review_body)', 'focusin', listener);
}

features.add({
	id: 'fit-textareas',
	init
});
