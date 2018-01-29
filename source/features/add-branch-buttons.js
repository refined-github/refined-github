import {h} from 'dom-chef';
import select from 'select-dom';
import toSemver from 'to-semver';
import * as icons from '../libs/icons';
import {groupButtons} from '../libs/utils';
import {getRepoURL, isRepoRoot} from '../libs/page-detect';

// This regex should match all of these combinations:
// "This branch is even with master."
// "This branch is 1 commit behind master."
// "This branch is 1 commit ahead of master."
// "This branch is 1 commit ahead, 27 commits behind master."
const branchInfoRegex = /([^ ]+)\.$/;

function getTagLink() {
	if (select.exists('.rgh-release-link')) {
		return;
	}
	const tags = select.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item')
		.map(element => element.dataset.name);
	const [latestRelease] = toSemver(tags, {clean: false});
	if (latestRelease) {
		const {href} = select(`[data-name="${latestRelease}"]`);
		const link = (
			<a
				class="btn btn-sm tooltipped tooltipped-ne rgh-release-link"
				href={href}
				aria-label={`Visit the latest release (${latestRelease})`}>
				{icons.tag()}
			</a>
		);
		const currentBranch = select('.branch-select-menu .js-select-button').textContent;
		if (currentBranch === latestRelease) {
			link.classList.add('disabled');
			link.setAttribute('aria-label', 'You’re on the latest release');
		}
		return link;
	}
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

function getDefaultBranchLink() {
	if (select.exists('.rgh-default-branch-link')) {
		return;
	}

	const branchName = getDefaultBranchNameIfDifferent();
	if (!branchName) {
		return;
	}

	const url = isRepoRoot() ?
		`/${getRepoURL()}` :
		select(`.select-menu-item[data-name='${branchName}']`).href;

	return (
		<a
			class="btn btn-sm tooltipped tooltipped-ne rgh-default-branch-link"
			href={url}
			aria-label={`Visit the default branch (${branchName})`}>
			{icons.chevronLeft()}
		</a>
	);
}

export default function () {
	const branchSelector = select('.branch-select-menu .select-menu-button');
	if (!branchSelector) {
		return;
	}
	const defaultBranch = getDefaultBranchLink();
	if (defaultBranch) {
		branchSelector.before(defaultBranch);
	}
	const tag = getTagLink();
	if (tag) {
		branchSelector.after(tag);
	}
	if (defaultBranch || tag) {
		groupButtons(branchSelector.parentElement.querySelectorAll(':scope > .btn'));
	}
}
