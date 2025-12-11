import features from '../feature-manager.js';
// Bypassing problematic external imports

// --- Custom DOM Utilities to replace missing 'select-dom' exports ---
// Implements the functionality of select-dom's 'all' using native APIs
// FIX 2: Set return type to 'Element[]' by default
function all(selector: string, context: ParentNode = document): Element[] {
	return [...context.querySelectorAll(selector)];
}

// Implements the functionality of select-dom's 'exists' using native APIs
function exists(selector: string, context: ParentNode = document): boolean {
	return Boolean(context.querySelector(selector));
}
// --------------------------------------------------------------------

// Define the URLs where the feature should run
const applicableUrlPatterns = [
	/issues\/\d+/,
	/pull\/\d+/,
	/discussions\/\d+/,
];

// Selector for containers that hold comments, issue bodies, or discussion posts
const conversationItemSelector = '.TimelineItem, .DiscussionItem, .js-comment';

// FIX 1: Change parameter type from HTMLElement to Element
function highlightElement(element: Element): void {
	// Explicitly type the 'badge' variable as 'Element' (FIX for implicit any)
	const isSponsor = all(
		'[data-hovercard-type="sponsor"], .Label--sponsor',
		element,
	).some((badge: Element) => badge.textContent?.includes('Sponsor'));

	const officialSponsorBadgeExists = exists('.github-sponsors-badge-v1', element);

	if (isSponsor || officialSponsorBadgeExists) {
		// Find the header (which is an Element)
		const header = all('.TimelineItem-header, .DiscussionItem-header, .comment-header', element)[0];

		if (header) {
			// FIX 3: Cast header to HTMLElement to access classList
			(header as HTMLElement).classList.add('color-bg-sponsors', 'color-fg-sponsors');
		}
	}
}

function init(): void {
	// 1. Run on all existing elements on page load.
	for (const element of all(conversationItemSelector)) {
		highlightElement(element);
	}
}

// FIX: Dedicated function to satisfy the strict 'PromisableBooleanFunction' type
function isApplicableUrl(): boolean {
	return applicableUrlPatterns.some(regex => regex.test(location.pathname));
}

void features.add(
	'highlight-sponsor-contributions',
	{
		// Pass the checking function in an array
		include: [isApplicableUrl],
		init,
	},
);

