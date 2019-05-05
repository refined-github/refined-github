/*
Hide all empty sections (or just their "empty" label) in discussion sidebar
*/

import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const canEditSidebar = select.exists('.discussion-sidebar .octicon-gear');

	// Reviewers
	const reviewers = select('[aria-label="Select reviewers"] > .css-truncate')!;
	if (reviewers.children.length === 0) {
		if (canEditSidebar) {
			reviewers.remove();
		} else {
			reviewers.closest('.discussion-sidebar-item')!.remove();
		}
	}

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
		}
	}

	// Labels
	const labels = select('.js-issue-labels')!;
	if (labels.children.length === 0) {
		if (canEditSidebar) {
			labels.remove();
		} else {
			labels.closest('.discussion-sidebar-item')!.remove();
		}
	} else if (!canEditSidebar) {
		select('.sidebar-labels div.discussion-sidebar-heading')!.remove();
	}

	// Projects
	const projects = select('.sidebar-projects')!;
	if (projects.children.length === 0) {
		if (canEditSidebar) {
			projects.remove();
		} else {
			projects.closest('.discussion-sidebar-item')!.remove();
		}
	}

	// Milestones
	const milestones = select('.sidebar-milestone')!;
	if (!select.exists('.milestone-name', milestones)) {
		if (canEditSidebar) {
			const lastTextNode = milestones.lastChild!.lastChild!;
			if (lastTextNode.textContent!.trim() === 'No milestone') {
				lastTextNode.remove();
			} else {
				throw new Error('Refined GitHub: milestones in sidebar could not be hidden');
			}
		} else {
			milestones.closest('.discussion-sidebar-item')!.remove();
		}
	}

	// Notifications
	select('.sidebar-notifications .discussion-sidebar-heading')!.remove();
}

features.add({
	id: 'link-to-file-in-file-history',
	include: [
		features.isIssue,
		features.isPRConversation
	],
	load: features.onAjaxedPages,
	init
});
