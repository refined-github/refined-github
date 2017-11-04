import 'webext-dynamic-content-scripts';
import OptionsSync from 'webext-options-sync';
import onAjaxedPages from 'github-injection';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import toSemver from 'to-semver';
import linkifyIssues from 'linkify-issues';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import {h} from 'dom-chef';

import markUnread from './libs/mark-unread';
import addOpenAllNotificationsButton from './libs/open-all-notifications';
import addGistCopyButton from './libs/copy-gist';
import addUploadBtn from './libs/upload-button';
import enableCopyOnY from './libs/copy-on-y';
import addReactionParticipants from './libs/reactions-avatars';
import showRealNames from './libs/show-names';
import addCopyFilePathToPRs from './libs/copy-file-path';
import addFileCopyButton from './libs/copy-file';
// - import copyMarkdown from './libs/copy-markdown';
import linkifyCode, {editTextNodes} from './libs/linkify-urls-in-code';
import autoLoadMoreNews from './libs/auto-load-more-news';
import addOPLabels from './libs/op-labels';
import addMoreDropdown from './libs/more-dropdown';
import addReleasesTab from './libs/add-releases-tab';
import addTimeMachineLinksToComments from './features/add-time-machine-links-to-comments';
import scrollToTopOnCollapse from './libs/scroll-to-top-on-collapse';
import removeDiffSigns from './libs/remove-diff-signs';

import * as icons from './libs/icons';
import * as pageDetect from './libs/page-detect';
import {getUsername, observeEl, safeElementReady, safely} from './libs/utils';

// Add globals for easier debugging
window.$ = $;
window.select = select;

const repoUrl = pageDetect.getRepoURL();
const options = new OptionsSync();

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

function hideEmptyMeta() {
	if (pageDetect.isRepoRoot()) {
		const meta = select('.repository-meta');
		if (select.exists('em', meta) && !select.exists('.js-edit-repo-meta-button')) {
			meta.style.display = 'none';
		}
	}
}

// Hide other users starring/forking your repos
async function hideOwnStars() {
	const {hideStarsOwnRepos} = await options.getAll();

	if (hideStarsOwnRepos) {
		const username = getUsername();
		observeEl('#dashboard .news', () => {
			$('#dashboard .news .watch_started, #dashboard .news .fork')
				.has(`a[href^="/${username}"]`)
				.css('display', 'none');
		});
	}
}

function moveMarketplaceLinkToProfileDropdown() {
	const lastDivider = select.all('.user-nav .dropdown-divider').pop();
	if (!lastDivider) {
		return;
	}
	const marketplaceLink = <a class="dropdown-item" href="/marketplace">Marketplace</a>;
	const divider = <div class="dropdown-divider"></div>;
	lastDivider.before(divider);
	lastDivider.before(marketplaceLink);
}

async function addTrendingMenuItem() {
	const selectedClass = pageDetect.isTrending() ? 'selected' : '';
	const issuesLink = await safeElementReady('.HeaderNavlink[href="/issues"], .header-nav-link[href="/issues"]');
	issuesLink.parentNode.after(
		<li class="header-nav-item">
			<a href="/trending" class={`js-selected-navigation-item HeaderNavlink header-nav-link px-2 ${selectedClass}`} data-hotkey="g t">Trending</a>
		</li>
	);

	// Explore link highlights /trending urls by default, remove that behavior
	if (pageDetect.isTrending()) {
		const exploreLink = await safeElementReady('a[href="/explore"]').catch(() => null);
		if (exploreLink) {
			exploreLink.classList.remove('selected');
		}
	}
}

function addProfileHotkey() {
	const menuItem = select(`#user-links a.dropdown-item[href="/${getUsername()}"]`);

	if (menuItem) {
		menuItem.setAttribute('data-hotkey', 'g m');
	}
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
		for (const tab of select.all(`.subnav-links a[href*="user%3A${username}"]`)) {
			tab.href = tab.href.replace(`user%3A${username}`, '');
		}
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
				{icons.tag()}
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
				{icons.edit()}
			</a>
		);
	}

	readmeContainer.appendChild(buttons);
}

function addDeleteForkLink() {
	const postMergeDescription = select('#partial-pull-merging .merge-branch-description');

	if (postMergeDescription) {
		const currentBranch = postMergeDescription.querySelector('.commit-ref');
		const forkPath = currentBranch ? currentBranch.title.split(':')[0] : null;

		if (forkPath && forkPath !== repoUrl) {
			postMergeDescription.append(
				<a id="refined-github-delete-fork-link" href={`/${forkPath}/settings`}>
					Delete fork
				</a>
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

function markMergeCommitsInList() {
	for (const commit of select.all('.commits-list-item:not(.refined-github-merge-commit)')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			commit.classList.add('refined-github-merge-commit');
			commit.querySelector('.commit-avatar-cell').prepend(icons.mergedPullRequest());
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

	container.after(
		<div class="diffbar-item refined-github-toggle-whitespace">
			<a href={url}
				data-hotkey="d w"
				class={`btn btn-sm btn-outline BtnGroup-item tooltipped tooltipped-s ${hidingWhitespace ? 'bg-gray-light text-gray-light' : ''}`}
				aria-label={`${hidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs`}>
				{hidingWhitespace ? icons.check() : ''}
				{' '}
				No Whitespace
			</a>
		</div>
	);

	// Make space for the new button by removing "Changes from" #655
	select('[data-hotkey="c"]').firstChild.remove();
}

// When navigating with next/previous in review mode, preserve whitespace option.
function preserveWhitespaceOptionInNav() {
	const navLinks = select.all('.commit > .BtnGroup.float-right > a.BtnGroup-item');
	if (navLinks.length === 0) {
		return;
	}

	const url = new URL(location.href);
	const hidingWhitespace = url.searchParams.get('w') === '1';

	if (hidingWhitespace) {
		for (const a of navLinks) {
			const linkUrl = new URL(a.href);
			linkUrl.searchParams.set('w', '1');
			a.href = linkUrl;
		}
	}
}

function addMilestoneNavigation() {
	select('.repository-content').before(
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
		.before(
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
		select('#projects-feature ~ p.note').after(
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

function openCIDetailsInNewTab() {
	const CIDetailsLinks = select.all('a.status-actions');
	for (const link of CIDetailsLinks) {
		link.setAttribute('target', '_blank');
		link.setAttribute('rel', 'noopener');
	}
}

async function init() {
	await safeElementReady('body');
	if (document.body.classList.contains('logged-out')) {
		return;
	}

	if (select.exists('html.refined-github')) {
		console.count('Refined GitHub was loaded multiple times: https://github.com/sindresorhus/refined-github/issues/479');
		return;
	}

	document.documentElement.classList.add('refined-github');

	if (!pageDetect.isGist()) {
		safely(addTrendingMenuItem);
	}

	if (pageDetect.isDashboard()) {
		safely(moveAccountSwitcherToSidebar);
	}

	// Ensure that confirm buttons are always in focus
	window.addEventListener('facebox:reveal', () => {
		select('.facebox-content button').focus();
	});

	// Support keyboard shortcuts in comments
	$(document).on('keydown', '.js-comment-field', event => {
		const field = event.target;
		if (event.key === 'Tab' && !event.shiftKey) {
			// Don't indent if the suggester box is active
			if (select.exists('.suggester.active')) {
				return;
			}

			indentInput(field);
			return false;
		} else if (event.key === 'Enter' && event.shiftKey) {
			const singleCommentButton = select('.review-simple-reply-button', field.form);

			if (singleCommentButton) {
				singleCommentButton.click();
				return false;
			}
		} else if (event.key === 'Escape') {
			const cancelButton = select('.js-hide-inline-comment-form', field.form);

			if (field.value !== '' && cancelButton) {
				cancelButton.click();
				return false;
			}
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

	// TODO: Enable this when we've improved how copying Markdown works
	// See #522
	// $(document).on('copy', '.markdown-body', copyMarkdown);

	domLoaded.then(onDomReady);
}

function onDomReady() {
	safely(markUnread.setup);
	safely(addOpenAllNotificationsButton);
	safely(addProfileHotkey);

	if (!pageDetect.isGist()) {
		safely(moveMarketplaceLinkToProfileDropdown);
	}

	if (pageDetect.isGist()) {
		safely(addGistCopyButton);
	}

	if (pageDetect.isDashboard()) {
		safely(hideOwnStars);
		safely(autoLoadMoreNews);
	}

	observeEl('div[role=main]', addUploadBtn, {childList: true, subtree: true});

	onAjaxedPages(ajaxedPagesHandler);
}

function ajaxedPagesHandler() {
	safely(linkifyCode);
	safely(hideEmptyMeta);
	safely(addTitleToEmojis);
	safely(enableCopyOnY.destroy);

	safely(() => {
		for (const a of select.all('a[href]')) {
			shortenLink(a, location.href);
		}
	});

	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
		safely(addYoursMenuItem);
	}

	if (pageDetect.isMilestone()) {
		safely(addMilestoneNavigation); // Needs to be before sortMilestonesByClosestDueDate
	}

	if (pageDetect.isRepo()) {
		safely(addMoreDropdown);
		safely(addReleasesTab);
		safely(removeProjectsTab);
		safely(addReadmeButtons);
		safely(addDiffViewWithoutWhitespaceOption);
		safely(removeDiffSigns);
		safely(sortMilestonesByClosestDueDate); // Needs to be after addMilestoneNavigation
	}

	if (pageDetect.isPR()) {
		safely(scrollToTopOnCollapse);
		safely(linkifyBranchRefs);
		safely(addDeleteForkLink);
		safely(fixSquashAndMergeTitle);
		safely(openCIDetailsInNewTab);
	}

	if (pageDetect.isQuickPR()) {
		safeElementReady('.branch-name').then(el => {
			const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
			const branchUrl = `/${ownerName}/${repoName}/tree/${el.textContent}`;
			$(el).closest('.branch-name').wrap(<a href={branchUrl}></a>);
		});
	}

	if (pageDetect.isPR() || pageDetect.isIssue()) {
		safely(linkifyIssuesInTitles);
		observeEl('.new-discussion-timeline', () => {
			safely(addOPLabels);
			safely(addTimeMachineLinksToComments);
		});
	}

	if (pageDetect.isPRList() || pageDetect.isIssueList()) {
		safely(addFilterCommentsByYou);
		safely(showRecentlyPushedBranches);
	}

	if (pageDetect.isCommit()) {
		safely(addPatchDiffLinks);
	}

	if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
		safely(addReactionParticipants);
		safely(showRealNames);
	}

	if (pageDetect.isCommitList()) {
		safely(markMergeCommitsInList);
	}

	if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
		safely(addCopyFilePathToPRs);
		safely(preserveWhitespaceOptionInNav);
	}

	if (pageDetect.isSingleFile()) {
		safely(addFileCopyButton);
		safely(enableCopyOnY.setup);
	}

	if (pageDetect.isRepoSettings()) {
		safely(addProjectNewLink);
	}
}

init();
