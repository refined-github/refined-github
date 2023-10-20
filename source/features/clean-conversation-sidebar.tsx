import './clean-conversation-sidebar.css';
import React from 'dom-chef';
import {$, elementExists} from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import onElementRemoval from '../helpers/on-element-removal.js';
import observe from '../helpers/selector-observer.js';
import {removeTextNodeContaining} from '../helpers/dom-utils.js';
import {isHasSelectorSupported} from '../helpers/select-has.js';

const canEditSidebar = onetime((): boolean => elementExists('.discussion-sidebar-item [data-hotkey="l"]'));

function getNodesAfter(node: Node): Range {
	const range = new Range();
	range.selectNodeContents(node.parentElement!);
	range.setStartAfter(node);
	return range;
}

async function cleanReviewers(): Promise<void> {
	const possibleReviewers = $('[src$="/suggested-reviewers"]');
	if (possibleReviewers) {
		await onElementRemoval(possibleReviewers);
	}

	const content = $('[aria-label="Select reviewers"] > .css-truncate')!;
	if (!content.firstElementChild) {
		removeTextNodeContaining(content, 'No reviews');
	}
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
	const container = $(`:is(form, .discussion-sidebar-item):has(${selector})`);
	if (!container) {
		return false;
	}

	const identifiers = [
		'.IssueLabel',
		'[aria-label="Select milestones"] .Progress-item',
		'[aria-label="Link issues"] [data-hovercard-type]',
		'[aria-label="Select projects"] .Link--primary',
	];

	const heading = $([
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
	$('#partial-discussion-sidebar')!.classList.add('rgh-clean-sidebar');

	// Assignees
	const assignees = $('.js-issue-assignees')!;
	if (assignees.children.length === 0) {
		assignees.closest('.discussion-sidebar-item')!.remove();
	} else {
		const assignYourself = $('.js-issue-assign-self');
		if (assignYourself) {
			removeTextNodeContaining(assignYourself.previousSibling!, 'No one—');
			$('[aria-label="Select assignees"] summary')!.append(
				<span style={{fontWeight: 'normal'}}> – {assignYourself}</span>,
			);
			assignees.closest('.discussion-sidebar-item')!.classList.add('rgh-clean-sidebar');
		}
	}

	// Reviewers
	if (pageDetect.isPR()) {
		void cleanReviewers();
	}

	// Labels
	if (!cleanSection('.js-issue-labels') && !canEditSidebar()) {
		// Hide heading in any case except `canEditSidebar`
		$('.discussion-sidebar-item:has(.js-issue-labels) .discussion-sidebar-heading')!
			.remove();
	}

	// Development (linked issues/PRs)
	const developmentHint = $('[aria-label="Link issues"] p');
	if (developmentHint) { // This may not exist if issues are disabled
		removeTextNodeContaining(developmentHint, /No branches or pull requests|Successfully merging/);
	}

	const createBranchLink = $('button[data-action="click:create-issue-branch#openDialog"]');
	if (createBranchLink) {
		createBranchLink.classList.add('Link--muted');
		$('[aria-label="Link issues"] summary')!.append(
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
	asLongAs: [
		isHasSelectorSupported,
	],
	include: [
		pageDetect.isConversation,
	],
	awaitDomReady: true, // The sidebar is at the end of the page + it needs to be fully loaded
	init,
});

/*

Test URLs:

* open issue: https://github.com/refined-github/sandbox/issues/15
* open issue with linked PR: https://github.com/refined-github/sandbox/issues/3
* closed issue: https://github.com/refined-github/sandbox/issues/56
* draft PR: https://github.com/refined-github/sandbox/pull/7
* merged PR: https://github.com/refined-github/sandbox/pull/58
* open issue with a milestone and assignee: https://github.com/microsoft/TypeScript/issues/18836
* User has triage access
  * issue: https://github.com/download-directory/download-directory.github.io/issues/39
  * PR: https://github.com/download-directory/download-directory.github.io/pull/37

*/
