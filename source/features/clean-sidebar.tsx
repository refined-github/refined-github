import './clean-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {isPR} from '../libs/page-detect';

let canEditSidebar = false;

// Selector points to element containing list of elements or "No labels" text
function cleanSection(selector: string): boolean {
	const list = select(selector)!;
	if (list.children.length === 0) {
		const section = list.closest('.discussion-sidebar-item')!;
		if (canEditSidebar) {
			list.remove();
			section.classList.add('rgh-clean-sidebar');
		} else {
			section.remove();
		}

		return true;
	}

	return false;
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
		cleanSection('[aria-label="Select reviewers"] > .css-truncate');
	}

	// Labels
	if (!cleanSection('.js-issue-labels') && !canEditSidebar) {
		select('.sidebar-labels div.discussion-sidebar-heading')!.remove();
	}

	// Projects
	cleanSection('.sidebar-projects');

	// Milestones
	const milestones = select('.sidebar-milestone')!;
	const milestonesInfo = milestones.lastChild!.lastChild!;
	if (milestonesInfo.textContent!.trim() === 'No milestone') {
		if (canEditSidebar) {
			milestonesInfo.remove();
			milestones.classList.add('rgh-clean-sidebar');
		} else {
			milestones.remove();
		}
	}

	// Notifications
	select('.sidebar-notifications .discussion-sidebar-heading')!.remove();
}

function init(): void {
	canEditSidebar = select.exists('.sidebar-labels .octicon-gear');
	clean();
	observeEl('.discussion-sidebar', clean);
}

features.add({
	id: 'clean-sidebar',
	description: 'Hide all empty sections (or just their "empty" label) in the discussion sidebar',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
