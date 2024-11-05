import {css} from 'code-tag';

export type UrlMatch = [expectations: number, url: string];

/** The repo navigation bar */
export const repoUnderlineNavUl = '.js-responsive-underlinenav ul.UnderlineNav-body';
export const repoUnderlineNavUl_ = [
	[1, 'https://github.com/refined-github/refined-github'],
	[1, 'https://github.com/refined-github/refined-github/releases'],
] satisfies UrlMatch[];

export const standaloneGistLinkInMarkdown = css`
	:is(.js-comment-body, .react-issue-comment) p a:only-child:is(
		[href^="https://gist.github.com/"],
		[href^="${location.origin}/gist/"]
	)
` as 'a'; // TODO: Drop after https://github.com/fregante/code-tag/issues/12
export const standaloneGistLinkInMarkdown_ = [
	[3, 'https://github.com/refined-github/sandbox/issues/77'],
] satisfies UrlMatch[];

/** The repo navigation bar’s overflow menu */
export const repoUnderlineNavDropdownUl = '.js-responsive-underlinenav action-menu ul';
export const repoUnderlineNavDropdownUl_ = [
	// Added via JS :(
	// TODO: Use Puppeteer?
	[1, 'https://github.com/refined-github/refined-github'],
	[1, 'https://github.com/refined-github/refined-github/releases'],
] satisfies UrlMatch[];

export const branchSelector = '[data-hotkey="w"]';
export const branchSelector_ = [
	[1, 'https://github.com/refined-github/refined-github'],
	// Added via JS :(
	// TODO: Use Puppeteer?
	[0, 'https://github.com/refined-github/refined-github/blob/main/readme.md'],
	[0, 'https://github.com/refined-github/refined-github/blame/main/readme.md'],
	[0, 'https://github.com/refined-github/refined-github/tree/main/source'],
	[1, 'https://github.com/refined-github/sandbox/tree/branch/with/slashes'],
	[1, 'https://github.com/refined-github/sandbox/commits/branch/with/slashes'],
	[1, 'https://github.com/refined-github/sandbox/commits'],
] satisfies UrlMatch[];

export const branchSelectorParent = 'details#branch-select-menu';
export const branchSelectorParent_ = branchSelector_;

export const directoryListingFileIcon = [
	// .color-fg-muted selects only files; some icon extensions use `img` tags
	'.react-directory-filename-column > :is(svg, img).color-fg-muted',
	'.js-navigation-container .octicon-file',
];
export const directoryListingFileIcon_ = [
	[1, 'https://github.com/refined-github/refined-github'],
	[1, 'https://github.com/refined-github/refined-github/tree/main/.github'],
] satisfies UrlMatch[];

export const prCommit = '.TimelineItem--condensed:has(.octicon-git-commit)';
export const prCommit_ = [
	[1, 'https://github.com/refined-github/sandbox/pull/10'],
] satisfies UrlMatch[];

// `summary` is needed because the details dropdown contains the list of check runs, each with its status icon
export const prCommitStatusIcon = `:is(${prCommit}) details.commit-build-statuses summary .octicon`;
export const prCommitStatusIcon_ = [
	// Icon not loaded when logged out :(
	[0, 'https://github.com/refined-github/sandbox/pull/10'],
] satisfies UrlMatch[];

// `.color-fg-open` is needed because of the icon added by `highlight-non-default-base-branch`
export const openPrsListLink = css`
	.js-issue-row:has(
		.octicon-git-pull-request.color-fg-open,
		.octicon-git-pull-request-draft
	) a.js-navigation-open
`;
export const openPrsListLink_ = [
	[4, 'https://github.com/refined-github/sandbox/issues?q=conflict'],
] satisfies UrlMatch[];

export const openIssueToLastComment = `
	:is(.js-issue-row, .js-pinned-issue-list-item)
	.Link--muted:is(
		a[aria-label$="comment"],
		a[aria-label$="comments"]
	)
`;
export const openIssueToLastComment_ = [
	[2, 'https://github.com/refined-github/sandbox/labels/bug'],
] satisfies UrlMatch[];

export const actionsTab = '#actions-tab';
export const actionsTab_ = [
	[1, 'https://github.com/refined-github/sandbox'],
] satisfies UrlMatch[];

export const paginationButtonSelector = '.ajax-pagination-form button.ajax-pagination-btn';
export const paginationButtonSelector_ = [
	[2, 'https://github.com/refined-github/sandbox/pull/10'],
] satisfies UrlMatch[];

export const codeSearchHeader = css`
	div:has(
		> [aria-label^="Collapse "],
		> [aria-label^="Expand "]
	)
`;
export const codeSearchHeader_ = [
	// Search not available when logged out :(
	[0, 'https://github.com/search?q=repo%3Arefined-github%2Frefined-github&type=code'],
] satisfies UrlMatch[];

export const linksToConversationLists = `
	a:is(
		[href*="/issues"],
		[href*="/pulls"],
		[href*="/projects"],
		[href*="/labels/"]
	):not(
		[href*="sort%3A"],
		[href*="page="],
		.issues-reset-query,
		.pagination *,
		.table-list-header-toggle *
	)
`;
export const linksToConversationLists_ = [
	[6, 'https://github.com/fregante/iphone-inline-video/issues?q=cool+is%3Aissue+is%3Aopen+'],
	[26, 'https://github.com/fregante/iphone-inline-video/issues?q=cool+is%3Aissue+is%3Aclosed'],
] satisfies UrlMatch[];

export const newCommentField = [
	'[input="fc-new_comment_field"]',
	'[input^="fc-new_inline_comment_discussion"]',
	'[aria-labelledby="comment-composer-heading"]',
];

export const newCommentField_ = [] satisfies UrlMatch[];

export const commitHashLinkInLists = [
	'[data-testid="commit-row-browse-repo"]', // `isCommitList`
	'[aria-label="View commit details"] a.text-mono', // `isCommitList` TODO: remove in May 2025
	'a[id^="commit-details-"]', // `isPRCommitList`
	'.js-details-container .text-right code a.Link--secondary', // `isPRConversation`
] as unknown as Array<'a'>;
export const commitHashLinkInLists_ = [
	[35, 'https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174'],
	[4, 'https://github.com/refined-github/refined-github/pull/6194/commits'],
	[5, 'https://github.com/refined-github/refined-github/pull/6194#event-8016526003'],
] satisfies UrlMatch[];

export const commitTitleInLists = [
	'[data-testid="list-view-item-title-container"]', // `isCommitList`
	'.js-commits-list-item .Details p.mb-1', // `isPRCommitList`,
];
export const commitTitleInLists_ = [
	[35, 'https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174'],
	[4, 'https://github.com/refined-github/refined-github/pull/6194/commits'],
];

const botNames = [
	'actions-user',
	'bors',
	'ImgBotApp',
	'renovate-bot',
	'rust-highfive',
	'scala-steward',
	'weblate',
	'apps', // Matches any `/apps/*` URLs
] as const;

const botAttributes = botNames.map(bot => `[href^="/${bot}"]`).join(', ');

// All co-authored commits are excluded because it's unlikely that any bot co-authors with another bot, but instead they're co-authored with a human. In that case we don't want to dim the commit.
// ^= is needed to match /apps/* URLs
export const botLinksCommitSelectors = [
	// Co-authored commits are excluded because their avatars are not linked
	`a[data-testid="avatar-icon-link"]:is(${botAttributes})`,

	// Legacy view, still used by PR commits
	// :only-child excludes co-authored commits
	`a[data-test-selector="commits-avatar-stack-avatar-link"]:is(${botAttributes}):only-child`,
];

export const botLinksPrSelectors = [
	...botNames.flatMap(bot => [
		`.opened-by [title$="pull requests created by ${bot}"]`,
		`.opened-by [title$="pull requests opened by ${bot}"]`,
	]),
	'.opened-by [href*="author%3Aapp%2F"]', // Search query `is:pr+author:app/*`
	'.labels [href$="label%3Abot"]', // PR tagged with `bot` label
];

export const usernameLinksSelector = [
	// `a` selector needed to skip commits by non-GitHub users
	// # targets mannequins #6504
	// `show_full_name` is for GHE: https://github.com/refined-github/refined-github/issues/7232#issuecomment-1910803157
	`:is(
		.js-discussion a.author,
		.inline-comments a.author,
		.react-issue-comment a[data-testid='avatar-link']
	):not(
		[href="#"],
		[href*="/apps/"],
		[href*="/marketplace/"],
		[data-hovercard-type="organization"],
		[show_full_name="true"]
	)`,

	// On dashboard
	// `.Link--primary` excludes avatars
	// [aria-label="card content"] excludes links in cards #6530 #6915
	'#dashboard a.Link--primary[data-hovercard-type="user"]:not([aria-label="card content"] *)',
] as unknown as Array<'a'>;
