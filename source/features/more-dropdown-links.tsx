import './more-dropdown-links.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import * as pageDetect from 'github-url-detection';

import features from '.';
import getDefaultBranch from '../github-helpers/get-default-branch';
import createDropdownItem from '../github-helpers/create-dropdown-item';
import {buildRepoURL, getCurrentCommittish} from '../github-helpers';

export async function unhideOverflowDropdown(): Promise<boolean> {
	// Wait for the tab bar to be loaded
	const repoNavigationBar = await elementReady('.UnderlineNav-body');

	// No dropdown on mobile #5781
	if (!select.exists('.js-responsive-underlinenav')) {
		return false;
	}

	repoNavigationBar!.parentElement!.classList.add('rgh-has-more-dropdown');
	return true;
}

async function init(): Promise<void> {
	const reference = getCurrentCommittish() ?? await getDefaultBranch();
	const compareUrl = buildRepoURL('compare', reference);
	const commitsUrl = buildRepoURL('commits', reference);
	const branchesUrl = buildRepoURL('branches');
	const dependenciesUrl = buildRepoURL('network/dependencies');
	await unhideOverflowDropdown();

	// Wait for the nav dropdown to be loaded #5244
	const repoNavigationDropdown = await elementReady('.UnderlineNav-actions ul');
	repoNavigationDropdown!.append(
		<li className="dropdown-divider" role="separator"/>,
		createDropdownItem('Compare', compareUrl),
		pageDetect.isEnterprise() ? '' : createDropdownItem('Dependencies', dependenciesUrl),
		createDropdownItem('Commits', commitsUrl),
		createDropdownItem('Branches', branchesUrl),
	);
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepo,
	],
	exclude: [
		pageDetect.isEmptyRepo,

		// No dropdown on mobile #5781
		() => !select.exists('.js-responsive-underlinenav'),
	],
	awaitDomReady: false,
	init,
});
