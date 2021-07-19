import './clean-conversation-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '.';
import onElementRemoval from '../helpers/on-element-removal';
import onReplacedElement from '../helpers/on-replaced-element';

const canEditSidebar = onetime((): boolean => select.exists('.discussion-sidebar-item [data-hotkey="l"]'));

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

@param selector Element that contains `details` or `.discussion-sidebar-heading` or distinctive element inside it
*/
function cleanSection(selector: string): boolean {
	const container = select(selector)?.closest('form, .discussion-sidebar-item');
	if (!container) {
		return false;
	}

	const heading = select(':scope > details, :scope > .discussion-sidebar-heading', container)!;

	// Magic. Do not touch.
	// Section is empty if: no sibling element OR empty sibling element
	if (heading.nextElementSibling?.firstElementChild) {
		return false;
	}

	const section = container.closest('.discussion-sidebar-item')!;
	if (canEditSidebar()) {
		getNodesAfter(heading).deleteContents();
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
				<span style={{fontWeight: 'normal'}}> – {assignYourself}</span>,
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
			content.remove(); // Drop "No reviews"
		}
	}

	// Labels
	if (!cleanSection('.js-issue-labels') && !canEditSidebar()) {
		// Hide heading in any case except `canEditSidebar`
		select('.js-issue-labels')!
			.closest('.discussion-sidebar-item')!
			.querySelector(':scope > .discussion-sidebar-heading')!
			.remove();
	}

	// Linked issues/PRs
	select('[aria-label="Link issues"] p')?.remove(); // "Successfully merging a pull request may close this issue." This may not exist if issues are disabled
	cleanSection('[aria-label="Link issues"]');

	// Projects
	cleanSection('[aria-label="Select projects"]');

	// Milestones
	cleanSection('[aria-label="Select milestones"]');
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation,
	],
	additionalListeners: [
		() => {
			void onReplacedElement('#partial-discussion-sidebar', clean);
		},
	],
	deduplicate: 'has-rgh-inner',
	init: clean,
});
