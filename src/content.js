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
import {getUsername, observeEl, safeElementReady} from './libs/utils';

// Add globals for easier debugging
window.$ = $;
window.select = select;

const repoUrl = pageDetect.getRepoURL();

function linkifyBranchRefs() {
	let deletedBranch = false;
	const lastBranchAction = select.all(`
		.discussion-item-head_ref_deleted .head-ref,
		.discussion-item-head_ref_restored .head-ref
	`).pop();
	if (lastBranchAction && lastBranchAction.closest('.discussion-item-head_ref_deleted')) {
		deletedBranch = lastBranchAction.title;
	}

	for (const el of select.all('.commit-ref[title], .base-ref[title], .head-ref[title]')) {
		if (el.textContent === 'unknown repository') {
			continue;
		}

		if (el.title === deletedBranch) {
			el.title = 'Deleted: ' + el.title;
			el.style.textDecoration = 'line-through';
			continue;
		}

		const branchUrl = '/' + el.title.replace(':', '/tree/');
		$(el).closest('.commit-ref').wrap(<a href={branchUrl}></a>);
	}
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
		<a href={`/${repoUrl}/compare`} class="dropdown-item refined-github-compare-tab" data-skip-pjax>
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
	const secondListItem = await elementReady('.header[role="banner"] ul[role="navigation"] li:nth-child(3)');
	secondListItem.insertAdjacentElement('afterEnd',
		<li>
			<a href="/trending" class="js-selected-navigation-item header-navlink" data-selected-links="/trending" data-hotkey="g t">Trending</a>
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
	const readmeContainer = select('.repository-content > #readme');
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

function removeSelectableWhiteSpaceFromDiffs() {
	for (const commentBtn of select.all('.add-line-comment')) {
		for (const node of commentBtn.childNodes) {
			if (node.nodeType === Node.TEXT_NODE) {
				node.remove();
			}
		}
	}
}

/* Lasciate ogne speranza, voi ch'intrate. */
function removeDiffSigns() {
	for (const line of select.all('tr:not(.refined-github-diff-signs)')) {
		line.classList.add('refined-github-diff-signs');
		for (const code of select.all('.blob-code-inner', line)) {
			// Drop -, + or space
			code.firstChild.textContent = code.firstChild.textContent.slice(1);

			// If a line is empty, the next line will collapse
			if (code.textContent.length === 0) {
				code.prepend(new Text(' '));
			}
		}
	}
}

function removeDiffSignsAndWatchExpansions() {
	removeSelectableWhiteSpaceFromDiffs();
	removeDiffSigns();
	for (const file of $('.diff-table:not(.rgh-watching-lines)').has('.diff-expander')) {
		file.classList.add('rgh-watching-lines');
		observeEl(file.tBodies[0], removeDiffSigns);
	}
}

function markMergeCommitsInList() {
	for (const commit of select.all('.commits-list-item:not(.refined-github-merge-commit)')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			commit.querySelector('.commit-avatar-cell').prepend(icons.mergedPullRequest.cloneNode(true));
			commit.querySelector('.avatar').classList.add('avatar-child');
		}
	}
}

function indentInput(el, size = 4) {
	const selection = window.getSelection().toString();
	const {selectionStart, selectionEnd, value} = el;
	const isMultiLine = /\n/.test(selection);
	const firstLineStart = value.lastIndexOf('\n', selectionStart) + 1;

	el.focus();

	if (isMultiLine) {
		const selectedLines = value.substring(firstLineStart, selectionEnd);

		// Find the start index of each line
		const indexes = selectedLines.split('\n').map(line => line.length);
		indexes.unshift(firstLineStart);
		indexes.pop();

		// `indexes` contains lengths. Update them to point to each line start index
		for (let i = 1; i < indexes.length; i++) {
			indexes[i] += indexes[i - 1] + 1;
		}

		for (let i = indexes.length - 1; i >= 0; i--) {
			el.setSelectionRange(indexes[i], indexes[i]);
			document.execCommand('insertText', false, ' '.repeat(size));
		}

		// Restore selection position
		el.setSelectionRange(
			selectionStart + size,
			selectionEnd + (size * indexes.length)
		);
	} else {
		const indentSize = (size - ((selectionEnd - firstLineStart) % size)) || size;
		document.execCommand('insertText', false, ' '.repeat(indentSize));
	}
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

function moveAccountSwitcherToSidebar() {
	safeElementReady('.dashboard-sidebar').then(sidebar => {
		const switcher = select('.account-switcher');
		if (switcher) {
			sidebar.prepend(switcher);
		}
	});
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

	if (pageDetect.isDashboard()) {
		moveAccountSwitcherToSidebar();
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
		if (options.hideStarsOwnRepos) {
			observeEl('#dashboard .news', () => {
				$('#dashboard .news .watch_started, #dashboard .news .fork')
					.has(`.title a[href^="/${username}"]`)
					.css('display', 'none');
			});
		}

		autoLoadMoreNews();
	}

	observeEl('div[role=main]', addUploadBtn, {childList: true, subtree: true});

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
				observeEl('.new-discussion-timeline', addOPLabels, {childList: true, subtree: true});
			}

			if (pageDetect.isPRList() || pageDetect.isIssueList()) {
				addFilterCommentsByYou();
				showRecentlyPushedBranches();
			}

			if (pageDetect.isCommit()) {
				addPatchDiffLinks();
			}

			if (pageDetect.hasDiff()) {
				const diffElements = select('.js-discussion, #files');
				if (diffElements) {
					observeEl(diffElements, removeDiffSignsAndWatchExpansions, {childList: true, subtree: true});
				}
				addDiffViewWithoutWhitespaceOption();
			}

			if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
				addReactionParticipants();
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
