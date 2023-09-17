/** The repo navigation bar */
export const repoUnderlineNavUl = '.js-responsive-underlinenav ul.UnderlineNav-body';
export const repoUnderlineNavUl_ = [
	'https://github.com/refined-github/refined-github',
	'https://github.com/refined-github/refined-github/releases',
];

/** The repo navigation bar’s overflow menu */
export const repoUnderlineNavDropdownUl = '.js-responsive-underlinenav .dropdown-menu ul';
export const repoUnderlineNavDropdownUl_ = repoUnderlineNavUl_;

export const branchSelector = '[data-hotkey="w"]';
export const branchSelector_ = [
	'https://github.com/refined-github/refined-github',
	'https://github.com/refined-github/refined-github/blob/main/readme.md',
	'https://github.com/refined-github/refined-github/blame/main/readme.md',
	'https://github.com/refined-github/refined-github/tree/main/source',
	'https://github.com/refined-github/sandbox/tree/branch/with/slashes',
	'https://github.com/refined-github/sandbox/commits/branch/with/slashes',
	'https://github.com/refined-github/sandbox/commits',
];

export const branchSelectorParent = 'details#branch-select-menu';
export const branchSelectorParent_ = branchSelector_;

export const directoryListingFileIcon = [
	// .color-fg-muted selects only files; some icon extensions use `img` tags
	'.react-directory-filename-column > :is(svg, img).color-fg-muted',
	'.js-navigation-container .octicon-file',
];
export const directoryListingFileIcon_ = [
	'https://github.com/refined-github/refined-github',
	'https://github.com/refined-github/refined-github/tree/main/.github',
];

export const prCommit = '.TimelineItem--condensed:has(.octicon-git-commit)';
export const prCommit_ = [
	'https://github.com/refined-github/sandbox/pull/10',
];

// `summary` is needed because the details dropdown contains the list of check runs, each with its status icon
export const prCommitStatusIcon = `:is(${prCommit}) details.commit-build-statuses summary .octicon`;
export const prCommitStatusIcon_ = [
	'https://github.com/refined-github/sandbox/pull/10',
];

export const actionsTab = '#actions-tab';
export const actionsTab_ = [
	'https://github.com/refined-github/sandbox',
];
