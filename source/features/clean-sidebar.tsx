import './clean-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import oneTime from 'onetime';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';
import {isPR} from 'github-page-detection';
import onReplacedElement from '../libs/on-replaced-element';

const canEditSidebar = oneTime((): boolean => select.exists('.sidebar-labels .octicon-gear'));

function getNodesAfter(node: Node): Range {
	const range = new Range();
	range.selectNodeContents(node.parentElement!);
	range.setStartAfter(node);
	return range;
}

/**
Smartly removes "No content" or the whole section, depending on `canEditSidebar`.

Expected DOM:

```pug
.discussion-sidebar-item
	form (may be missing)
		details or div.discussion-sidebar-heading
		.css-truncate (may be missing)
			"No issues"
```

@param containerSelector Element that contains `details` or `.discussion-sidebar-heading`
*/
function cleanSection(containerSelector: string): boolean {
	const container = select(containerSelector)!;
	const header = select(':scope > details, :scope > .discussion-sidebar-heading', container)!;

	// Magic. Do not touch
	if (header.nextElementSibling?.firstElementChild) {
		return false;
	}

	const section = container.closest('.discussion-sidebar-item')!;
	if (canEditSidebar()) {
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
			assignYourself.previousSibling!.remove(); // Drop "No one — "
			select('[aria-label="Select assignees"] summary')!.append(
				<span style={{fontWeight: 'normal'}}> – {assignYourself}</span>
			);
			assignees.closest('.discussion-sidebar-item')!.classList.add('rgh-clean-sidebar');
		}
	}

	// Reviewers
	if (isPR()) {
		cleanSection('[aria-label="Select reviewers"]');
	}

	// Labels
	if (!cleanSection('.sidebar-labels') && !canEditSidebar()) {
		// Hide header in any case except `canEditSidebar`
		select('.sidebar-labels div.discussion-sidebar-heading')!.remove();
	}

	// Linked issues/PRs
	select('[aria-label="Link issues"] p')!.remove(); // "Successfully merging a pull request may close this issue."
	cleanSection('[aria-label="Link issues"]');

	// Projects
	cleanSection('[aria-label="Select projects"]');

	// Milestones
	cleanSection('[aria-label="Select milestones"]');
}

features.add({
	id: __filebasename,
	description: 'Hides empty sections (or just their "empty" label) in the discussion sidebar.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/57199809-20691780-6fb6-11e9-9672-1ad3f9e1b827.png'
}, {
	include: [
		pageDetect.isIssue,
		pageDetect.isPRConversation
	],
	additionalListeners: [
		() => onReplacedElement('#partial-discussion-sidebar', clean)
	],
	init: clean
});
