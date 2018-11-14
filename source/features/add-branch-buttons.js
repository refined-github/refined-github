import {h} from 'dom-chef';
import select from 'select-dom';
import compareVersions from 'tiny-version-compare';
import * as icons from '../libs/icons';
import {appendBefore} from '../libs/utils';
import {groupSiblings} from '../libs/group-buttons';
import getDefaultBranch from '../libs/get-default-branch';
import {getRepoURL, isRepoRoot} from '../libs/page-detect';

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

async function getDefaultBranchLink() {
	const defaultBranch = await getDefaultBranch();
	const currentBranch = select('[data-hotkey="w"] span').textContent;

	// Don't show the button if we’re already on the default branch
	if (defaultBranch === undefined || defaultBranch === currentBranch) {
		return;
	}

	let url;
	if (isRepoRoot()) {
		url = `/${getRepoURL()}`;
	} else {
		const branchLink = select(`.select-menu-item[data-name='${defaultBranch}']`);
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
			{defaultBranch}
		</a>
	);
}

export default async function () {
	const container = select('.file-navigation');
	if (!container) {
		return;
	}
	const wrapper = (
		<div class="rgh-branch-buttons">
			{await getDefaultBranchLink() || ''}
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
