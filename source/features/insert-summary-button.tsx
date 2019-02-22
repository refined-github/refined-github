import React from 'dom-chef';
import select from 'select-dom';
import {stripIndent} from 'common-tags';
import features from '../libs/features';
import * as icons from '../libs/icons';

function addButtons() {
	for (const toolbar of select.all('markdown-toolbar')) {
		const toolbarGroup = select('.toolbar-group:first-child', toolbar);

		if (toolbarGroup) {
			toolbarGroup.append(
				<button type="button" class="toolbar-item rgh-summary-btn tooltipped tooltipped-n" onClick={addSummaryDetails} aria-label="Add summary">
					{icons.info()}
				</button>
			);
		}
	}
}

function addSummaryDetails(event) {
	const form = event.target.closest('form');
	const commentField = select('textarea', form);

	const pos = commentField.selectionStart;
	const currentVal = commentField.value;
	const before = currentVal.slice(0, pos);
	const after = currentVal.slice(pos);

	const summaryContent = stripIndent`
		<details>
			<summary>Details</summary>
			<!-- Replace this comment with content you don't want to be seen unless 'Details' is expanded. -->
		</details>
	`;

	commentField.value = before + summaryContent + after;
}

function init() {
	addButtons();
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
