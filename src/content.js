import 'webext-dynamic-content-scripts';
import OptionsSync from 'webext-options-sync';
import elementReady from 'element-ready';
import gitHubInjection from 'github-injection';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import toSemver from 'to-semver';
import linkifyIssues from 'linkify-issues';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import {h} from 'dom-chef';

import markUnread from './libs/mark-unread';
import addGistCopyButton from './libs/copy-gist';
import addUploadBtn from './libs/upload-button';
import diffFileHeader from './libs/diffheader';
import enableCopyOnY from './libs/copy-on-y';
import addReactionParticipants from './libs/reactions-avatars';
import showRealNames from './libs/show-names';
import addCopyFilePathToPRs from './libs/copy-file-path';
import addFileCopyButton from './libs/copy-file';
import copyMarkdown from './libs/copy-markdown';
import linkifyCode, {editTextNodes} from './libs/linkify-urls-in-code';
import autoLoadMoreNews from './libs/auto-load-more-news';
import addOPLabels from './libs/op-labels';

import * as icons from './libs/icons';
import * as pageDetect from './libs/page-detect';
import {getUsername, observeEl} from './libs/utils';

// Add globals for easier debugging
window.$ = $;
window.select = select;

const repoUrl = pageDetect.getRepoURL();

function getCanonicalBranchFromRef($element) {
	const refSelector = '.commit-ref, .head-ref, .base-ref';

	return $element.find(refSelector).addBack(refSelector).filter('[title]').attr('title');
}

function linkifyBranchRefs() {
	let deletedBranchName = null;
	const $deletedBranchInTimeline = $('.discussion-item-head_ref_deleted');
	if ($deletedBranchInTimeline.length > 0) {
		deletedBranchName = getCanonicalBranchFromRef($deletedBranchInTimeline);
	}

	$('.commit-ref').each((i, el) => {
		if (el.firstElementChild.textContent === 'unknown repository') {
			return;
		}

		const $el = $(el);
		const canonicalBranch = getCanonicalBranchFromRef($el);

		if (deletedBranchName && canonicalBranch === deletedBranchName) {
			$el.attr('title', 'Deleted: ' + canonicalBranch);
			return;
		}

		const branchUrl = canonicalBranch.replace(':', '/tree/');

		$el.wrap(<a href={`/${branchUrl}`}></a>);
	});
}

function appendReleasesCount(count) {
	if (!count) {
		return;
	}

	select('.reponav-releases').append(<span class="Counter">{count}</span>);
}

function cacheReleasesCount() {
	const releasesCountCacheKey = `${repoUrl}-releases-count`;

	if (pageDetect.isRepoRoot()) {
		const releasesCount = select('.numbers-summary a[href$="/releases"] .num').textContent.trim();
		appendReleasesCount(releasesCount);
		chrome.storage.local.set({[releasesCountCacheKey]: releasesCount});
	} else {
		chrome.storage.local.get(releasesCountCacheKey, items => {
			appendReleasesCount(items[releasesCountCacheKey]);
		});
	}
}

function addCompareLink() {
	if (select.exists('.refined-github-compare-tab')) {
		return;
	}

	select('.reponav-dropdown .dropdown-menu').prepend(
		<a href={`/${repoUrl}/compare`} class="dropdown-item refined-github-compare-tab">
			{icons.darkCompare}
			<span itemprop="name"> Compare</span>
		</a>
	);
}

function renameInsightsDropdown() {
	const dropdown = select('.reponav-item.reponav-dropdown');
	if (dropdown) {
		dropdown.firstChild.textContent = 'More ';
	} else {
		// GHE doesn't have the Insights dropdown currently, so create a dropdown
		const moreDropdown = <div class="reponav-dropdown js-menu-container">
			<button type="button" class="btn-link reponav-item reponav-dropdown js-menu-target " data-no-toggle="" aria-expanded="false" aria-haspopup="true">More <svg aria-hidden="true" class="octicon octicon-triangle-down v-align-middle text-y" height="11" version="1.1" viewBox="0 0 12 16" width="8"><path fill-rule="evenodd" d="M0 5l6 6 6-6z"></path></svg></button>
			<div class="dropdown-menu-content js-menu-content">
				<div class="dropdown-menu dropdown-menu-sw"></div>
			</div>
		</div>;

		const settingsTab = select('[data-selected-links~="repo_settings"]');
		if (settingsTab) {
			settingsTab.parentNode.insertBefore(moreDropdown, settingsTab);
		} else {
			select('.reponav').appendChild(moreDropdown);
		}
	}
}

function hideEmptyMeta() {
	if (pageDetect.isRepoRoot()) {
		const meta = select('.repository-meta');
		if (select.exists('em', meta) && !select.exists('.js-edit-repo-meta-button')) {
			meta.style.display = 'none';
		}
	}
}

function moveMarketplaceLinkToProfileDropdown() {
	const thirdDropdownItem = select('.dropdown-item[href="/explore"]');
	const marketplaceLink = <a class="dropdown-item" href="/marketplace">Marketplace</a>;
	thirdDropdownItem.insertAdjacentElement('afterend', marketplaceLink);
}

function addReleasesTab() {
	if (select.exists('.reponav-releases')) {
		return;
	}

	const releasesTab = (
		<a href={`/${repoUrl}/releases`} class="reponav-item reponav-releases" data-hotkey="g r" data-selected-links={`repo_releases /${repoUrl}/releases`}>
			{icons.tag}
			<span> Releases </span>
		</a>
	);

	select('.reponav-dropdown, [data-selected-links~="repo_settings"]')
		.insertAdjacentElement('beforeBegin', releasesTab);

	cacheReleasesCount();

	if (pageDetect.isReleases()) {
		releasesTab.classList.add('js-selected-navigation-item', 'selected');
		select('.reponav-item.selected')
			.classList.remove('js-selected-navigation-item', 'selected');
	}
}

async function addTrendingMenuItem() {
	const secondListItem = await elementReady('.header-nav.float-left .header-nav-item:nth-child(2)');

	secondListItem.insertAdjacentElement('afterEnd',
		<li class="header-nav-item">
			<a href="/trending" class="header-nav-link" data-hotkey="g t">Trending</a>
		</li>
	);
}

function addYoursMenuItem() {
	const pageName = pageDetect.isIssueSearch() ? 'issues' : 'pulls';
	const username = getUsername();

	if (select.exists('.refined-github-yours')) {
		return;
	}

	const yoursMenuItem = <a href={`/${pageName}?q=is%3Aopen+is%3Aissue+user%3A${username}`} class="subnav-item refined-github-yours">Yours</a>;

	if (!select.exists('.subnav-links .selected') && location.search.includes(`user%3A${username}`)) {
		yoursMenuItem.classList.add('selected');
	}

	select('.subnav-links').append(yoursMenuItem);
}

function addReadmeButtons() {
	const readmeContainer = select('#readme.readme');
	if (!readmeContainer) {
		return;
	}

	const buttons = <div id="refined-github-readme-buttons"></div>;

	/**
	 * Generate Release button
	 */
	const tags = select.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item')
		.map(element => [
			element.getAttribute('data-name'),
			element.getAttribute('href')
		]);
	const releases = new Map(tags);
	const [latestRelease] = toSemver([...releases.keys()], {clean: false});
	if (latestRelease) {
		buttons.appendChild(
			<a
				class="tooltipped tooltipped-nw"
				href={`${releases.get(latestRelease)}#readme`}
				aria-label={`View this file at the latest version (${latestRelease})`}>
				{icons.tag}
			</a>
		);
	}

	/**
	 * Generate Edit button
	 */
	if (select('.branch-select-menu i').textContent === 'Branch:') {
		const readmeName = select('#readme > h3').textContent.trim();
		const path = select('.breadcrumb').textContent.trim().split('/').slice(1).join('/');
		const currentBranch = select('.branch-select-menu .select-menu-item.selected').textContent.trim();
		buttons.appendChild(
			<a
				href={`/${repoUrl}/edit/${currentBranch}/${path}${readmeName}`}
				class="tooltipped tooltipped-nw"
				aria-label="Edit this file">
				{icons.edit}
			</a>
		);
	}

	readmeContainer.appendChild(buttons);
}

function addDeleteForkLink() {
	const postMergeDescription = select('#partial-pull-merging .merge-branch-description');

	if (postMergeDescription) {
		const currentBranch = postMergeDescription.querySelector('.commit-ref.current-branch');
		const forkPath = currentBranch ? currentBranch.title.split(':')[0] : null;

		if (forkPath && forkPath !== repoUrl) {
			postMergeDescription.append(
				<p id="refined-github-delete-fork-link">
					<a href={`/${forkPath}/settings`}>
						{icons.fork}
						Delete fork
					</a>
				</p>
			);
		}
	}
}

function linkifyIssuesInTitles() {
	observeEl(select('#partial-discussion-header').parentNode, () => {
		const title = select('.js-issue-title:not(.refined-linkified-title)');
		if (title) {
			title.classList.add('refined-linkified-title');
			editTextNodes(linkifyIssues, title);
		}
	});
}

function addPatchDiffLinks() {
	if (select.exists('.sha-block.patch-diff-links')) {
		return;
	}

	let commitUrl = location.pathname.replace(/\/$/, '');

	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	select('.commit-meta span.float-right').append(
		<span class="sha-block patch-diff-links">
			<a href={`${commitUrl}.patch`} class="sha">patch</a>
			{ ' ' /* Workaround for: JSX eats whitespace between elements */ }
			<a href={`${commitUrl}.diff`} class="sha">diff</a>
		</span>
	);
}

function removeDiffSigns() {
	$('.diff-table:not(.refined-github-diff-signs)')
		.addClass('refined-github-diff-signs')
		.find(`
			.blob-code-addition .blob-code-inner,
			.blob-code-deletion .blob-code-inner
		`)
		.each((index, el) => {
			el.firstChild.textContent = el.firstChild.textContent.slice(1);
		});
}

function markMergeCommitsInList() {
	$('.commit.commits-list-item.table-list-item:not(.refined-github-merge-commit)').each((index, element) => {
		const $element = $(element);
		const messageText = $element.find('.commit-title').text();
		if (/Merge pull request #/.test(messageText)) {
			$element
				.addClass('refined-github-merge-commit')
				.find('.commit-avatar-cell')
					.prepend('<svg aria-hidden="true" class="octicon octicon-git-pull-request" height="36" role="img" version="1.1" viewBox="0 0 12 16" width="27"><path d="M11 11.28c0-1.73 0-6.28 0-6.28-0.03-0.78-0.34-1.47-0.94-2.06s-1.28-0.91-2.06-0.94c0 0-1.02 0-1 0V0L4 3l3 3V4h1c0.27 0.02 0.48 0.11 0.69 0.31s0.3 0.42 0.31 0.69v6.28c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72z m-1 2.92c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2zM4 3c0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72 0 1.55 0 5.56 0 6.56-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V4.72c0.59-0.34 1-0.98 1-1.72z m-0.8 10c0 0.66-0.55 1.2-1.2 1.2s-1.2-0.55-1.2-1.2 0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2z m-1.2-8.8c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z"></path></svg>')
					.find('img')
						.addClass('avatar-child');
		}
	});
}

function indentInput(el, size = 4) {
	el.focus();
	const value = el.value;
	const selectionStart = el.selectionStart;
	const indentSize = (size - (el.selectionEnd % size)) || size;
	const indentationText = ' '.repeat(indentSize);
	el.value = value.slice(0, selectionStart) + indentationText + value.slice(el.selectionEnd);
	el.selectionStart = selectionStart + indentationText.length;
	el.selectionEnd = selectionStart + indentationText.length;
}

async function showRecentlyPushedBranches() {
	// Don't duplicate on back/forward in history
	if (select.exists('[data-url$=recently_touched_branches_list]')) {
		return;
	}

	const codeTabURL = select('[data-hotkey="g c"]').href;
	const fragmentURL = `/${repoUrl}/show_partial?partial=tree%2Frecently_touched_branches_list`;

	const html = await fetch(codeTabURL, {
		credentials: 'include'
	}).then(res => res.text());

	// https://github.com/sindresorhus/refined-github/issues/216
	if (html.includes(fragmentURL)) {
		select('.repository-content').prepend(<include-fragment src={fragmentURL}></include-fragment>);
	}
}

// Add option for viewing diffs without whitespace changes
function addDiffViewWithoutWhitespaceOption() {
	const container = select([
		'.table-of-contents.Details .BtnGroup', // In single commit view
		'.pr-review-tools > .diffbar-item' // In review view
	].join(','));

	if (!container || select.exists('.refined-github-toggle-whitespace')) {
		return;
	}

	const url = new URL(location.href);
	const hidingWhitespace = url.searchParams.get('w') === '1';

	if (hidingWhitespace) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', 1);
	}

	container.insertAdjacentElement('afterend',
		<div class="diffbar-item refined-github-toggle-whitespace">
			<a href={url}
				data-hotkey="d w"
				class={`btn btn-sm btn-outline BtnGroup-item tooltipped tooltipped-s ${hidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`}
				aria-label={`${hidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}>
				{hidingWhitespace ? icons.check : ''}
				{' '}
				No Whitespace
			</a>
		</div>
	);
}

function addMilestoneNavigation() {
	select('.repository-content').insertAdjacentElement('beforeBegin',
		<div class="subnav">
			<div class="subnav-links float-left" role="navigation">
				<a href={`/${repoUrl}/labels`} class="subnav-item">Labels</a>
				<a href={`/${repoUrl}/milestones`} class="subnav-item">Milestones</a>
			</div>
		</div>
	);
}

function addFilterCommentsByYou() {
	if (select.exists('.refined-github-filter')) {
		return;
	}
	select('.subnav-search-context .js-navigation-item:last-child')
		.insertAdjacentElement('beforeBegin',
			<a
				href={`/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}`}
				class="select-menu-item js-navigation-item refined-github-filter">
				<div class="select-menu-item-text">
					Everything commented by you
				</div>
			</a>
		);
}

function addProjectNewLink() {
	if (select.exists('#projects-feature:checked') && !select.exists('#refined-github-project-new-link')) {
		select(`#projects-feature ~ p.note`).insertAdjacentElement('afterEnd',
			<a href={`/${repoUrl}/projects/new`} class="btn btn-sm" id="refined-github-project-new-link">Add a project</a>
		);
	}
}

function removeProjectsTab() {
	const projectsTab = select('.js-repo-nav .reponav-item[data-selected-links^="repo_projects"]');
	if (projectsTab && projectsTab.querySelector('.Counter, .counter').textContent === '0') {
		projectsTab.remove();
	}
}

function fixSquashAndMergeTitle() {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}
	btn.addEventListener('click', () => {
		const title = select('.js-issue-title').textContent;
		const number = select('.gh-header-number').textContent;
		select('#merge_title_field').value = `${title.trim()} (${number})`;
	});
}

function addTitleToEmojis() {
	for (const emoji of select.all('g-emoji')) {
		emoji.setAttribute('title', `:${emoji.getAttribute('alias')}:`);
	}
}

function sortMilestonesByClosestDueDate() {
	for (const a of select.all('a[href$="/milestones"], a[href*="/milestones?"]')) {
		const url = new URL(a.href);
		// Only if they aren't explicitly sorted differently
		if (!url.searchParams.get('direction') && !url.searchParams.get('sort')) {
			url.searchParams.set('direction', 'asc');
			url.searchParams.set('sort', 'due_date');
			a.href = url;
		}
	}
}

function init() {
	//
	// const username = getUsername();
	// if (!username) {
	// 	return;
	// }

	if (select.exists('html.refined-github')) {
		console.count('Refined GitHub was loaded multiple times: https://github.com/sindresorhus/refined-github/issues/479');
		return;
	}

	document.documentElement.classList.add('refined-github');

	if (!pageDetect.isGist()) {
		addTrendingMenuItem();
	}

	// Support indent with tab key in comments
	$(document).on('keydown', '.js-comment-field', event => {
		if (event.which === 9 && !event.shiftKey) {
			// Don't indent if the suggester box is active
			if ($('.suggester').hasClass('active')) {
				return;
			}

			event.preventDefault();
			indentInput(event.target);
			return false;
		}
	});

	// Prompt user to confirm erasing a comment with the Cancel button
	$(document).on('click', '.js-hide-inline-comment-form', event => {
		// Do not prompt if textarea is empty
		const textarea = event.target.closest('.js-inline-comment-form').querySelector('.js-comment-field');
		if (textarea.value === '') {
			return;
		}

		if (window.confirm('Are you sure you want to discard your unsaved changes?') === false) { // eslint-disable-line no-alert
			event.stopPropagation();
			event.stopImmediatePropagation();
		}
	});

	// Handle issue list ajax
	$(document).on('pjax:end', () => {
		if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
			addYoursMenuItem();
		}
	});

	$(document).on('copy', '.markdown-body', copyMarkdown);

	onDomReady();
}

async function onDomReady() {
	const options = await new OptionsSync().getAll();
	await domLoaded;

	const username = getUsername();

	markUnread.setup();

	if (!pageDetect.isGist()) {
		moveMarketplaceLinkToProfileDropdown();
	}

	if (pageDetect.isGist()) {
		addGistCopyButton();
	}

	if (pageDetect.isDashboard()) {
		// Hide other users starring/forking your repos
		const hideStarsOwnRepos = () => {
			$('#dashboard .news .watch_started, #dashboard .news .fork')
				.has(`.title a[href^="/${username}"]`)
				.css('display', 'none');
		};

		if (options.hideStarsOwnRepos) {
			hideStarsOwnRepos();
			new MutationObserver(() => hideStarsOwnRepos())
				.observe(select('#dashboard .news'), {childList: true});
		}

		autoLoadMoreNews();
	}

	addUploadBtn();
	new MutationObserver(addUploadBtn).observe(select('div[role=main]'), {childList: true, subtree: true});

	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
		addYoursMenuItem();
	}

	if (pageDetect.isRepo()) {
		gitHubInjection(window, () => {
			hideEmptyMeta();
			renameInsightsDropdown();
			addReleasesTab();
			removeProjectsTab();
			addCompareLink();
			addTitleToEmojis();
			addReadmeButtons();

			for (const a of select.all('a[href]')) {
				shortenLink(a, location.href);
			}

			diffFileHeader.destroy();
			enableCopyOnY.destroy();

			if (pageDetect.isPR()) {
				linkifyBranchRefs();
				addDeleteForkLink();
				fixSquashAndMergeTitle();
			}

			if (pageDetect.isPR() || pageDetect.isIssue()) {
				linkifyIssuesInTitles();
				addOPLabels();
				new MutationObserver(addOPLabels).observe(select('.new-discussion-timeline'), {childList: true, subtree: true});
			}

			if (pageDetect.isPRList() || pageDetect.isIssueList()) {
				addFilterCommentsByYou();
				showRecentlyPushedBranches();
			}

			if (pageDetect.isCommit()) {
				addPatchDiffLinks();
			}

			if (pageDetect.hasDiff()) {
				removeDiffSigns();
				const diffElements = select('.js-discussion, #files');
				if (diffElements) {
					new MutationObserver(removeDiffSigns).observe(diffElements, {childList: true, subtree: true});
				}
				addDiffViewWithoutWhitespaceOption();
			}

			if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
				addReactionParticipants.add(username);
				addReactionParticipants.addListener(username);
				showRealNames();
			}

			if (pageDetect.isCommitList()) {
				markMergeCommitsInList();
			}

			if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
				diffFileHeader.setup();
				addCopyFilePathToPRs();
			}

			if (pageDetect.isSingleFile()) {
				addFileCopyButton();
				enableCopyOnY.setup();
			}

			if (pageDetect.isMilestone()) {
				addMilestoneNavigation();
			}

			if (pageDetect.hasCode()) {
				linkifyCode();
			}

			if (pageDetect.isRepoSettings()) {
				addProjectNewLink();
			}

			sortMilestonesByClosestDueDate(); // Needs to be after addMilestoneNavigation
		});
	}
}

init();
