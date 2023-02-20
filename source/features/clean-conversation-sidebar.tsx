import './clean-conversation-sidebar.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import onElementRemoval from '../helpers/on-element-removal';
import observe from '../helpers/selector-observer';
import {removeTextNodeContaining} from '../helpers/dom-utils';

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
	const container = select(`:is(form, .discussion-sidebar-item):has(${selector})`);
	if (!container) {
		return false;
	}

	const identifiers = [
		'.IssueLabel',
		'[aria-label="Select milestones"] .Progress-item',
		'[aria-label="Link issues"] [data-hovercard-type]',
		'[aria-label="Select projects"] .Link--primary',
	];

	const heading = select([
		'details:has(> .discussion-sidebar-heading)', // Can edit sidebar, has a dropdown
		'.discussion-sidebar-heading', // Cannot editor sidebar, has a plain heading
	], container)!;
	if (heading.closest('form, .discussion-sidebar-item')!.querySelector(identifiers)) {
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

async function cleanSidebar(): Promise<void> {
	select('#partial-discussion-sidebar')!.classList.add('rgh-clean-sidebar');

	// Assignees
	const assignees = select('.js-issue-assignees')!;
	if (assignees.children.length === 0) {
		assignees.closest('.discussion-sidebar-item')!.remove();
	} else {
		const assignYourself = select('.js-issue-assign-self');
		if (assignYourself) {
			removeTextNodeContaining(assignYourself.previousSibling!, 'No one—');
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
			// TODO: This blocks the whole function, it should be extracted
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
		select('.discussion-sidebar-item:has(.js-issue-labels) .discussion-sidebar-heading')!
			.remove();
	}

	// Development (linked issues/PRs)
	select('[aria-label="Link issues"] p')?.remove(); // "Successfully merging a pull request may close this issue." This may not exist if issues are disabled
	const createBranchLink = select('button[data-action="click:create-issue-branch#openDialog"]');
	if (createBranchLink) {
		createBranchLink.classList.add('Link--muted');
		select('[aria-label="Link issues"] summary')!.append(
			<span style={{fontWeight: 'normal'}}> – {createBranchLink}</span>,
		);
	}

	cleanSection('[aria-label="Link issues"]');

	// Projects
	cleanSection('[aria-label="Select projects"]');

	// Milestones
	cleanSection('[aria-label="Select milestones"]');
}

function init(signal: AbortSignal): void {
	observe('#partial-discussion-sidebar', cleanSidebar, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // The sidebar is at the end of the page + it needs to be fully loaded
	init,
});
