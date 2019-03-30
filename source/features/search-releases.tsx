import React from 'dom-chef';
import select from 'select-dom';
import OptionsSync from 'webext-options-sync';

import * as api from '../libs/api';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import {isReleasesOrTags} from '../libs/page-detect';
import {checkInline, x as closeIcon} from '../libs/icons';

type ReleasesResponseV4 = {
	releases: {
		totalCount: number;
		edges: [
			{
				node: {
					tagName: string;
				};
			}
		];
	};
};

/* eslint-disable @typescript-eslint/camelcase */
type ReleasesResponseV3 = {
	tag_name: string;
	html_url: string;
};
/* eslint-enable @typescript-eslint/camelcase */

type Release = {
	tag: string;
	htmlPage: string;
};

async function init() {
	if (!isReleasesOrTags()) {
		console.debug('Not on releases or tag page');

		return false;
	}

	if (!isReleasesTabSelected()) {
		console.debug('Release tab is not selected.');

		return false;
	}

	if (!hasAnyReleases()) {
		console.debug('No releases present for the selected repository.');

		return false;
	}

	const {personalToken} = await new OptionsSync().getAll();

	const releases = await fetchReleases(personalToken);
	addSelectMenu(releases);
	registerEventListener();
}

const isReleasesTabSelected = () => getSelectedTabText() === 'Releases';

const hasAnyReleases = () => select.exists('.release-entry') || select.exists('.release');

const getSelectedTabText = () => {
	const selectedTab = select('.subnav > .subnav-links > .selected');

	return selectedTab ? selectedTab.innerText : null;
};

const fetchReleases = async (personalToken): Promise<Release[]> => {
	const {ownerName, repoName} = getOwnerAndRepo();

	if (personalToken && personalToken.trim().length > 0) {
		return fetchReleasesV4(ownerName, repoName);
	}

	return fetchReleasesV3(ownerName, repoName);
};

const fetchReleasesV4 = async (ownerName, repoName): Promise<Release[]> => {
	try {
		const jsonResponse: Record<'repository', ReleasesResponseV4> = await api.v4(
			`{
			repository(owner: ${ownerName}, name: ${repoName}) {
				releases(first: 100, orderBy: { field: CREATED_AT, direction: DESC }) {
					totalCount
					edges {
						node {
							tagName
						}
					}
				}
			}
		}`
		);

		const releases: Release[] = jsonResponse.repository.releases.edges.map(
			({node: {tagName}}) => {
				return {
					tag: tagName,
					htmlPage: `https://github.com/${ownerName}/${repoName}/releases/tag/${tagName}`
				};
			}
		);

		return releases;
	} catch (error) {
		return Promise.reject(error);
	}
};

const fetchReleasesV3 = async (ownerName, repoName): Promise<Release[]> => {
	try {
		const jsonResponse = await api.v3(`repos/${ownerName}/${repoName}/releases?per_page=100`) as ReleasesResponseV3[];

		const releases: Release[] = jsonResponse.map(item => {
			return {tag: item.tag_name, htmlPage: item.html_url};
		});

		return releases;
	} catch (error) {
		return Promise.reject(error);
	}
};

const addSelectMenu = (releases: Release[]) => {
	const container = select('.subnav');

	const child = (
		<div class="float-right">
			{getSelectMenu({
				title: 'Releases',
				children: getAllReleasesLink(releases)
			})}
		</div>
	);

	container.append(child);
};

const getAllReleasesLink = (releases: Release[]) => {
	const selectedTag = getSelectedTagFromUrl();

	return releases.map(release => {
		return (
			<a
				href={release.htmlPage}
				class={`select-menu-item js-navigation-item ${
					release.tag === selectedTag ? 'selected' : ''
				}`}
			>
				{checkInline()}
				<div class="select-menu-item-text js-select-button-text">
					{release.tag}
				</div>
			</a>
		);
	});
};

const getSelectMenu = ({title, children}) => {
	const selectedTag = getSelectedTagFromUrl();

	// https://styleguide.github.com/primer/components/select-menu/#filter
	return (
		<div class="refined-github-search-releases select-menu js-menu-container js-select-menu">
			<button
				class="btn select-menu-button js-menu-target"
				type="button"
				aria-haspopup="true"
				aria-expanded="false"
			>
				<i>Filter:</i>&nbsp;
				<span class="js-select-button">
					{selectedTag ? selectedTag : title}
				</span>
				&nbsp;
			</button>
			<div class="select-menu-modal-holder js-menu-content js-navigation-container">
				<div class="select-menu-modal">
					<div class="select-menu-header" tabindex="-1">
						<button class="btn-link close-button js-menu-close" type="button">
							{closeIcon()}
						</button>
						<span class="select-menu-title">{title}</span>
					</div>
					<div class="js-select-menu-deferred-content">
						<div class="select-menu-filters">
							<div class="select-menu-text-filter">
								<input
									type="text"
									id="filter-field"
									class="form-control js-filterable-field js-navigation-enable"
									placeholder="Type to filter..."
									aria-label="Type to filter"
									autocomplete="off"
								/>
							</div>
						</div>
						<div
							class="select-menu-list"
							data-filterable-for="filter-field"
							data-filterable-type="substring"
						>
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const getSelectedTagFromUrl = () => {
	const currentUrl = location.href;
	const index = currentUrl.indexOf('/releases/tag/');

	return index > -1 ?
		currentUrl
			.substr(index)
			.split('/')
			.pop() :
		null;
};

const getFilterInput = () =>
	select('.refined-github-search-releases .js-filterable-field');

const eventListener = e => {
	if (e.which === 13) {
		const selectedLink = select(
			'.refined-github-search-releases .select-menu-item.js-navigation-item.navigation-focus'
		);

		window.location.assign(selectedLink.getAttribute('href'));
	}
};

const registerEventListener = () => {
	const filterInput = getFilterInput();

	return filterInput ?
		filterInput.addEventListener('keydown', eventListener) :
		null;
};

const deregisterEventListener = () => {
	const filterInput = getFilterInput();

	return filterInput ?
		filterInput.removeEventListener('keydown', eventListener) :
		null;
};

function deinit() {
	deregisterEventListener();
}

features.add({
	id: 'search-releases',
	include: [features.isReleasesOrTags],
	load: features.onDomReady,
	init,
	deinit
});
