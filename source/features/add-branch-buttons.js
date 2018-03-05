import {h} from 'dom-chef';
import select from 'select-dom';
import toSemver from 'to-semver';
import * as icons from '../libs/icons';
import {groupSiblings} from '../libs/group-buttons';
import {getRepoURL, isRepoRoot} from '../libs/page-detect';

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
		link.setAttribute('aria-label', 'Visit the latest release');
		link.append(' ', <span class="css-truncate-target">{latestRelease}</span>);
	}

	branchSelector.after(link);
	return true;
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

function addDefaultBranchLink(branchSelector) {
	const branchName = getDefaultBranchNameIfDifferent();
	if (!branchName) {
		return;
	}

	const url = isRepoRoot() ?
		`/${getRepoURL()}` :
		select(`.select-menu-item[data-name='${branchName}']`).href;

	branchSelector.before(
		<a
			class="btn btn-sm tooltipped tooltipped-ne"
			href={url}
			aria-label={`Visit the default branch (${branchName})`}>
			{icons.chevronLeft()}
		</a>
	);
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
