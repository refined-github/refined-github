import {h} from 'dom-chef';
import select from 'select-dom';
import compareVersions from 'tiny-version-compare';
import * as icons from '../libs/icons';
import {appendBefore} from '../libs/utils';
import {groupSiblings} from '../libs/group-buttons';
import {getRepoURL, isRepoRoot, getOwnerAndRepo} from '../libs/page-detect';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

function getTagLink() {
	const tags = select
		.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item')
		.map(element => element.dataset.name);

	if (tags.length === 0) {
		return;
	}

	const latestParsedRelease = tags
		.filter(tag => /\d/.test(tag))
		.sort(compareVersions)
		.pop();

	const latestRelease = latestParsedRelease || tags[0];

	const link = <a class="btn btn-sm btn-outline tooltipped tooltipped-ne">{icons.tag()}</a>;

	const currentBranch = select('.branch-select-menu .js-select-button').textContent;
	if (currentBranch === latestRelease) {
		link.classList.add('disabled');
		link.setAttribute('aria-label', 'You’re on the latest release');
	} else {
		link.href = select(`[data-name="${latestRelease}"]`).href;
		link.setAttribute('aria-label', 'Visit the latest release');
		link.append(' ', <span class="css-truncate-target">{latestRelease}</span>);
	}

	return link;
}

function getDefaultBranchNameIfDifferent() {
	const {ownerName, repoName} = getOwnerAndRepo();
	const cacheKey = `rgh-default-branch-${ownerName}-${repoName}`;

	// Return the cached name if it differs from the current one
	const cachedName = sessionStorage.getItem(cacheKey);
	if (cachedName) {
		const currentBranch = select('[data-hotkey="w"] span').textContent;
		return cachedName === currentBranch ? false : cachedName;
	}

	// We can find the name in the infobar, available in folder views
	const branchInfo = select('.branch-infobar');
	if (!branchInfo) {
		return;
	}

	// Parse the infobar
	const [, branchName] = branchInfo.textContent.trim().match(branchInfoRegex) || [];
	if (branchName) {
		// Temporarily cache it between loads to enable it on files
		sessionStorage.setItem(cacheKey, branchName);
		return branchName;
	}
}

function getDefaultBranchLink() {
	if (select.exists('.repohead h1 .octicon-repo-forked')) {
		return; // It's a fork, no "default branch" info available #1132
	}

	const branchName = getDefaultBranchNameIfDifferent();
	if (!branchName) {
		return;
	}

	let url;
	if (isRepoRoot()) {
		url = `/${getRepoURL()}`;
	} else {
		const branchLink = select(`.select-menu-item[data-name='${branchName}']`);
		if (!branchLink) {
			return;
		}
		url = branchLink.href;
	}

	return (
		<a
			class="btn btn-sm btn-outline tooltipped tooltipped-ne"
			href={url}
			aria-label="Visit the default branch">
			{icons.branch()}
			{' '}
			{branchName}
		</a>
	);
}

export default function () {
	const container = select('.file-navigation');
	if (!container) {
		return;
	}
	const wrapper = (
		<div class="rgh-branch-buttons">
			{getDefaultBranchLink() || ''}
			{getTagLink() || ''}
		</div>
	);

	if (wrapper.children.length > 0) {
		appendBefore(container, '.breadcrumb', wrapper);
	}

	if (wrapper.children.length > 1) {
		groupSiblings(wrapper.firstElementChild);
	}
}
