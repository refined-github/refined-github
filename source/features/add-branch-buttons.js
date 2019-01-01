import {h} from 'dom-chef';
import select from 'select-dom';
import compareVersions from 'tiny-version-compare';
import * as api from '../libs/api';
import * as icons from '../libs/icons';
import {appendBefore} from '../libs/utils';
import {groupSiblings} from '../libs/group-buttons';
import getDefaultBranch from '../libs/get-default-branch';
import {getRepoURL, isRepoRoot, getOwnerAndRepo} from '../libs/page-detect';

async function getTagLink() {
	const tags = select
		.all('.branch-select-menu .select-menu-list:last-child .select-menu-item')
		.map(element => element.dataset.name);

	if (tags.length === 0) {
		return;
	}

	let latestParsedRelease;
	// If all tags are plain versions, parse them,
	// otherwise fetch the latest.
	if (tags.every(tag => /^[vr]?\d/.test(tag))) {
		latestParsedRelease = tags.sort(compareVersions).pop();
	} else {
		const {ownerName, repoName} = getOwnerAndRepo();
		const {repository} = await api.v4(`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				refs(first: 1, refPrefix: "refs/tags/", orderBy: {
					field: TAG_COMMIT_DATE,
					direction: DESC
				}) {
					nodes {
						name
					}
				}
			}
		}`);
		if (repository.refs.nodes.length > 0) {
			latestParsedRelease = repository.refs.nodes[0].name;
		}
	}

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
	const [defaultLink = '', tagLink = ''] = await Promise.all([
		getDefaultBranchLink(),
		getTagLink()
	]);

	const wrapper = (
		<div class="rgh-branch-buttons">
			{defaultLink}
			{tagLink}
		</div>
	);

	if (wrapper.children.length > 0) {
		appendBefore(container, '.breadcrumb', wrapper);
	}

	if (wrapper.children.length > 1) {
		groupSiblings(wrapper.firstElementChild);
	}
}
