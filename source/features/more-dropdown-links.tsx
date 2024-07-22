import './more-dropdown-links.css';
import React from 'dom-chef';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';
import GitBranchIcon from 'octicons-plain-react/GitBranch';
import GitCommitIcon from 'octicons-plain-react/GitCommit';
import GitCompareIcon from 'octicons-plain-react/GitCompare';
import PackageDependenciesIcon from 'octicons-plain-react/PackageDependencies';
import {elementExists} from 'select-dom';

import features from '../feature-manager.js';
import createDropdownItem from '../github-helpers/create-dropdown-item.js';
import getCurrentGitRef from '../github-helpers/get-current-git-ref.js';
import getDefaultBranch from '../github-helpers/get-default-branch.js';
import {buildRepoURL} from '../github-helpers/index.js';

export async function unhideOverflowDropdown(): Promise<boolean> {
	// Wait for the tab bar to be loaded
	const repoNavigationBar = await elementReady('.UnderlineNav-body');

	// No dropdown on mobile #5781
	if (!elementExists('.js-responsive-underlinenav')) {
		return false;
	}

	repoNavigationBar!.parentElement!.classList.add('rgh-has-more-dropdown');
	return true;
}

async function init(): Promise<void> {
	const reference = getCurrentGitRef() ?? (await getDefaultBranch());
	const compareUrl = buildRepoURL('compare', reference);
	const commitsUrl = buildRepoURL('commits', reference);
	const branchesUrl = buildRepoURL('branches');
	const dependenciesUrl = buildRepoURL('network/dependencies');
	await unhideOverflowDropdown();

	// Wait for the nav dropdown to be loaded #5244
	const repoNavigationDropdown = await elementReady('.UnderlineNav-actions ul');
	repoNavigationDropdown!.append(
		<li className="dropdown-divider" role="separator" />,
		createDropdownItem({
			label: 'Compare',
			href: compareUrl,
			icon: GitCompareIcon,
		}),
		pageDetect.isEnterprise()
			? ''
			: createDropdownItem({
					label: 'Dependencies',
					href: dependenciesUrl,
					icon: PackageDependenciesIcon,
				}),
		createDropdownItem({
			label: 'Commits',
			href: commitsUrl,
			icon: GitCommitIcon,
		}),
		createDropdownItem({
			label: 'Branches',
			href: branchesUrl,
			icon: GitBranchIcon,
		}),
	);
}

void features.add(import.meta.url, {
	include: [pageDetect.hasRepoHeader],
	exclude: [
		pageDetect.isEmptyRepo,

		// No dropdown on mobile #5781
		() => !elementExists('.js-responsive-underlinenav'),
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true, // DOM-based filter
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github

*/
