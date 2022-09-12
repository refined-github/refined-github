import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '.';
import attachElement from '../helpers/attach-element';
import observe from '../helpers/selector-observer';

const button = features.getIdentifiers(import.meta.url);

const buttonStyle = {
	position: 'absolute',
	top: '2px',
	right: '2px',
	borderRadius: '4px',
} as const;

function clearField(event: DelegateEvent): void {
	const messageField = event.delegateTarget.previousElementSibling as HTMLTextAreaElement;
	const deduplicatedAuthors = new Set();

	// This method ensures that "Co-authored-by" capitalization doesn't affect deduplication
	for (const [, author] of messageField.value.matchAll(/co-authored-by: ([^\n]+)/gi)) {
		deduplicatedAuthors.add('Co-authored-by: ' + author);
	}

	messageField.value = [...deduplicatedAuthors].join('\n');
}

function attachButton(textarea: HTMLTextAreaElement): void {
	attachElement({
		anchor: textarea,
		after: () => <button type="button" className={'btn btn-sm ' + button.class} style={buttonStyle}>Clear</button>,
	});
}

function init(signal: AbortSignal): void {
	observe('textarea#merge_message_field', attachButton, {signal});
	delegate(document, button.selector, 'click', clearField, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	exclude: [
		// Don't clear 1-commit PRs #3140
		() => select.all('.TimelineItem.js-commit').length === 1,
	],
	deduplicate: false,
	init,
});
