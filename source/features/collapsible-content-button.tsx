import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate';
import features from '../libs/features';
import * as icons from '../libs/icons';

const addEvents = onetime(() => {
	delegate('.rgh-collapsible-content-btn', 'click', addContentToDetails);
});

// Wraps string in at least 2 \n on each side,
// as long as the field doesn't already have them.
// Code adopted/adapted from GitHub.
function smartBlockWrap(content: string, field: HTMLTextAreaElement) {
	const before = field.value.slice(0, field.selectionStart);
	const after = field.value.slice(field.selectionEnd);
	const [whitespaceAtStart] = before.match(/\n*$/) || [''];
	const [whitespaceAtEnd] = after.match(/^\n*/) || [''];
	let newlinesToAppend = '';
	let newlinesToPrepend = '';
	if (before.match(/\S/) && whitespaceAtStart.length < 2) {
		newlinesToPrepend = '\n'.repeat(2 - whitespaceAtStart.length);
	}
	if (after.match(/\S/) && whitespaceAtEnd.length < 2) {
		newlinesToAppend = '\n'.repeat(2 - whitespaceAtEnd.length)
	}

	return newlinesToPrepend + content + newlinesToAppend;
}

function init() {
	addEvents();
	for (const anchor of select.all('md-ref')) {
		anchor.after(
			<button type="button" class="toolbar-item tooltipped tooltipped-n rgh-collapsible-content-btn" aria-label="Add summary">
				{icons.foldDown()}
			</button>
		);
	}
}

function addContentToDetails(event) {
	const field = event.delegateTarget.form['comment[body]'];

	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = `
		<details>
		<summary>Details</summary>

		${getSelection().toString()}

		</details>
	`.replace(/(\n|\b)\t+/g, '$1').trim();

	// Inject new tags; it'll be undoable
	document.execCommand('insertText', false, smartBlockWrap(newContent, field));

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 1,
		field.value.lastIndexOf('</details>', field.selectionStart) - 1
	);
}

features.add({
	id: 'collapsible-content-button',
	include: [
		features.isPR,
		features.isIssue,
		features.isNewIssue,
		features.isCompare,
		features.isCommit
	],
	load: features.onAjaxedPages,
	init
});
