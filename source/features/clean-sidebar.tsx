import './clean-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import onUpdatableContentUpdate from '../libs/on-updatable-content-update';
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
