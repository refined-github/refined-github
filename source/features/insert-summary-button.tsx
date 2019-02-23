import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate';
import features from '../libs/features';
import * as icons from '../libs/icons';

const addEvents = onetime(() => {
	delegate('.rgh-summary-btn', 'click', addSummaryDetails);
});

function init() {
	addEvents();
	for (const anchor of select.all('md-task-list')) {
		anchor.after(
			<button type="button" class="toolbar-item tooltipped tooltipped-n rgh-summary-btn" aria-label="Add summary">
				{icons.info()}
			</button>
		);
	}
}

function addSummaryDetails(event) {
	// Don't indent <summary> because indentation will not be automatic on multi-line content
	const newContent = `
		<details>
		<summary>Details</summary>

		${getSelection().toString()}

		</details>
	`.replace(/(\n|\b)\t+/g, '$1').trim();

	// Inject new tags; it'll be undoable
	document.execCommand('insertText', false, '\n\n' + newContent + '\n\n');

	// Restore selection.
	// `selectionStart` will be right after the newly-inserted text
	const field = event.currentTarget.form['comment[body]'];
	field.setSelectionRange(
		field.value.lastIndexOf('</summary>', field.selectionStart) + '</summary>'.length + 1,
		field.value.lastIndexOf('</details>', field.selectionStart) - 1
	);
}

features.add({
	id: 'insert-summary-button',
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
