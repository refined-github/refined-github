import './clean-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import oneTime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onElementRemoval from '../helpers/on-element-removal';
import onReplacedElement from '../helpers/on-replaced-element';

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

	// Magic. Do not touch.
	// Section is empty if: no sibling element OR empty sibling element
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

async function clean(): Promise<void> {
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
	if (pageDetect.isPR()) {
		const possibleReviewers = select('[src$="/suggested-reviewers"]');
		if (possibleReviewers) {
			await onElementRemoval(possibleReviewers);
		}

		const content = select('[aria-label="Select reviewers"] > .css-truncate')!;
		if (!content.firstElementChild) {
			if (select.exists('.js-convert-to-draft')) {
				content.remove(); // Drop "No reviews"
			} else {
				cleanSection('[aria-label="Select reviewers"]');
			}
		}
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
