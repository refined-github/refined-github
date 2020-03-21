import './clean-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onUpdatableContentUpdate from '../libs/on-updatable-content-update';
import {isPR} from '../libs/page-detect';

let canEditSidebar = false;

function getNodesAfter(node: Node): Range {
	const range = new Range();
	range.selectNodeContents(node.parentElement!);
	range.setStartAfter(node);
	return range;
}

/**
Smartly removes "No content" or the whole section, depending on `canEditSidebar`.

Expected DOM:

.discussion-sidebar-item
	form (may be missing)
		details or div.discussion-sidebar-heading
		---
		--- these are direct children
		---

.discussion-sidebar-item
	form (may be missing)
		details or div.discussion-sidebar-heading
		(random wrapper element)
			---
			--- these are "children of child"
			---

@param container Selector of the element that contains `details` or `.discussion-sidebar-heading`
@param areItemsChildrenOfContainer False means they're not direct children, but instead "children of a child"
*/
function cleanSection(container: string, areItemsChildrenOfContainer: boolean): boolean {
	const section = select(container)!.closest('.discussion-sidebar-item')!;
	const header = select(':scope > details, :scope > .discussion-sidebar-heading', section)!;

	const isEmpty = areItemsChildrenOfContainer ?
		header.nextSibling!.textContent!.trim().startsWith('No') :
		header.nextElementSibling!.children.length === 0;
	if (!isEmpty) {
		return false;
	}

	if (canEditSidebar) {
		getNodesAfter(header).deleteContents();
		section.classList.add('rgh-clean-sidebar');
	} else {
		section.remove();
	}

	return true;
}

function clean(): void {
	if (select.exists('.rgh-clean-sidebar')) {
		return;
	}

	select('#partial-discussion-sidebar')!.classList.add('rgh-clean-sidebar');

	// Assignees
	const assignees = select('.js-issue-assignees')!;
	if (assignees.children.length === 0) {
		assignees.closest('.discussion-sidebar-item')!.remove();
	} else {
		const assignYourself = select('.js-issue-assign-self');
		if (assignYourself) {
			(assignYourself.previousSibling as ChildNode).remove(); // Drop "No one — "
			select('[aria-label="Select assignees"] summary')!.append(
				<span style={{fontWeight: 'normal'}}> – {assignYourself}</span>
			);
			assignees.closest('.discussion-sidebar-item')!.classList.add('rgh-clean-sidebar');
		}
	}

	// Reviewers
	if (isPR()) {
		cleanSection('[aria-label="Select reviewers"]', false);
	}

	// Labels
	if (!cleanSection('.sidebar-labels', false) && !canEditSidebar) {
		// Hide header in any case except `canEditSidebar`
		select('.sidebar-labels div.discussion-sidebar-heading')!.remove();
	}

	// Projects
	cleanSection('[aria-label="Select projects"]', false);

	// Milestones
	cleanSection('[aria-label="Select milestones"]', true);
}

function init(): void {
	canEditSidebar = select.exists('.sidebar-labels .octicon-gear');
	clean();
	onUpdatableContentUpdate(select('#partial-discussion-sidebar')!, clean);
}

features.add({
	id: __featureName__,
	description: 'Hides empty sections (or just their "empty" label) in the discussion sidebar.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/57199809-20691780-6fb6-11e9-9672-1ad3f9e1b827.png',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
