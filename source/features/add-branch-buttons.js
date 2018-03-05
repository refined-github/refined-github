import {h} from 'dom-chef';
import select from 'select-dom';
import toSemver from 'to-semver';
import * as icons from '../libs/icons';
import {groupSiblings} from '../libs/group-buttons';
import {getRepoURL, isRepoRoot, getOwnerAndRepo} from '../libs/page-detect';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

function addTagLink(branchSelector) {
	const tags = select.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item')
		.map(element => element.dataset.name);
	const [latestRelease] = toSemver(tags, {clean: false});
	if (!latestRelease) {
		return;
	}

	const link = <a class="btn btn-sm tooltipped tooltipped-ne">{icons.tag()}</a>;

	const currentBranch = select('.branch-select-menu .js-select-button').textContent;
	if (currentBranch === latestRelease) {
		link.classList.add('disabled');
		link.setAttribute('aria-label', 'You’re on the latest release');
	} else {
		link.href = select(`[data-name="${latestRelease}"]`).href;
		link.setAttribute('aria-label', `Visit the latest release (${latestRelease})`);
	}

	branchSelector.after(link);
	return true;
}

function getDefaultBranchNameIfDifferent() {
	// Return the cached name if it differs from the current one
	const cachedName = sessionStorage.getItem('rgh-default-branch');
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
		sessionStorage.setItem('rgh-default-branch', branchName);
		return branchName;
	}
}

function addDefaultBranchLink(branchSelector) {
	let branchInfo = getDefaultBranchNameIfDifferent();
	if (!branchInfo) {
		return;
	}

	branchInfo = branchInfo.split(':');
	const branchName = branchInfo.pop();
	const originalUser = branchInfo.pop();

	const url = isRepoRoot() ?
		`/${getRepoURL()}` :
		select(`.select-menu-item[data-name='${branchName}']`).href;

	// If it’s a fork, add link to originalUser
	if (originalUser) {
		const {ownerName: currentUser} = getOwnerAndRepo();
		const currentRepoUrl = select('.repohead [itemprop="name"] a').href;
		const originalRepoUrl = select('.fork-flag a').href;
		const originalBranchUrl = url
			.replace(currentRepoUrl, originalRepoUrl) // - isRepoRoot()
			.replace(currentUser, originalUser); // - !isRepoRoot()
		branchSelector.before(
			<a
				class="btn btn-sm tooltipped tooltipped-ne rgh-original-branch-button"
				href={originalBranchUrl}
				aria-label={`Visit the default branch (${branchName}) of the original repo`}>
				{icons.chevronLeft()}
				{icons.chevronLeft()}
			</a>
		);

		// Add link to current repo’s branch
		branchSelector.before(
			<a
				class="btn btn-sm tooltipped tooltipped-ne"
				href={url}
				aria-label={`Visit the default branch (${branchName})`}>
				{icons.chevronLeft()}
			</a>
		);
	}

	return true;
}

export default function () {
	const branchSelector = select('.branch-select-menu .select-menu-button');
	if (!branchSelector || select.exists('.rgh-branch-buttons')) {
		return;
	}
	const hasTag = addTagLink(branchSelector);
	const hasDefault = addDefaultBranchLink(branchSelector);
	if (hasDefault || hasTag) {
		const group = groupSiblings(branchSelector);
		group.classList.add('rgh-branch-buttons');
	}
}
