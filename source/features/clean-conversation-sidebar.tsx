import './clean-conversation-sidebar.css';
import React from 'dom-chef';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onElementRemoval from '../helpers/on-element-removal';
import onReplacedElement from '../helpers/on-replaced-element';

const canEditSidebar = onetime((): boolean => $exists('.sidebar-labels .octicon-gear'));

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
	const container = $(containerSelector);
	if (!container) {
		return false;
	}

	const header = $(':scope > details, :scope > .discussion-sidebar-heading', container)!;

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
	if ($exists('.rgh-clean-sidebar')) {
		return;
	}

	$('#partial-discussion-sidebar')!.classList.add('rgh-clean-sidebar');

	// Assignees
	const assignees = $('.js-issue-assignees')!;
	if (assignees.children.length === 0) {
		assignees.closest('.discussion-sidebar-item')!.remove();
	} else {
		const assignYourself = $('.js-issue-assign-self');
		if (assignYourself) {
			assignYourself.previousSibling!.remove(); // Drop "No one — "
			$('[aria-label="Select assignees"] summary')!.append(
				<span style={{fontWeight: 'normal'}}> – {assignYourself}</span>
			);
			assignees.closest('.discussion-sidebar-item')!.classList.add('rgh-clean-sidebar');
		}
	}

	// Reviewers
	if (pageDetect.isPR()) {
		const possibleReviewers = $('[src$="/suggested-reviewers"]');
		if (possibleReviewers) {
			await onElementRemoval(possibleReviewers);
		}

		const content = $('[aria-label="Select reviewers"] > .css-truncate')!;
		if (!content.firstElementChild) {
			content.remove(); // Drop "No reviews"
		}
	}

	// Labels
	if (!cleanSection('.sidebar-labels') && !canEditSidebar()) {
		// Hide header in any case except `canEditSidebar`
		$('.sidebar-labels div.discussion-sidebar-heading')!.remove();
	}

	// Linked issues/PRs
	$('[aria-label="Link issues"] p')!.remove(); // "Successfully merging a pull request may close this issue."
	cleanSection('[aria-label="Link issues"]');

	// Projects
	cleanSection('[aria-label="Select projects"]');

	// Milestones
	cleanSection('[aria-label="Select milestones"]');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation
	],
	additionalListeners: [
		() => void onReplacedElement('#partial-discussion-sidebar', clean)
	],
	init: clean
});
