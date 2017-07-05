import 'webext-dynamic-content-scripts';
import OptionsSync from 'webext-options-sync';
import elementReady from 'element-ready';
import gitHubInjection from 'github-injection';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import toSemver from 'to-semver';
import linkifyIssues from 'linkify-issues';
import select from 'select-dom';
import domLoaded from 'dom-loaded';
import domify from './libs/domify';

import markUnread from './libs/mark-unread';
import addGistCopyButton from './libs/copy-gist';
import addUploadBtn from './libs/upload-button';
import diffFileHeader from './libs/diffheader';
import enableCopyOnY from './libs/copy-on-y';
import addReactionParticipants from './libs/reactions-avatars';
import showRealNames from './libs/show-names';
import filePathCopyBtnListner from './libs/copy-file-path';
import addFileCopyButton from './libs/copy-file';
import copyMarkdown from './libs/copy-markdown';
import linkifyCode, {editTextNodes} from './libs/linkify-urls-in-code';
import autoLoadMoreNews from './libs/auto-load-more-news';
import * as icons from './libs/icons';
import * as pageDetect from './libs/page-detect';
import {getUsername} from './libs/utils';

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

	for (const el of select.all('.commit-ref')) {
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

		$el.wrap(`<a href="/${branchUrl}">`);
	}
}

function appendReleasesCount(count) {
	if (!count) {
		return;
	}

	$('.reponav-releases').append(`<span class="Counter">${count}</span>`);
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

	$('.reponav-dropdown .dropdown-menu').prepend(`
		<a href="/${repoUrl}/compare" class="dropdown-item refined-github-compare-tab">
			${icons.darkCompare}
			<span itemprop="name">Compare</span>
		</a>
	`);
}

function renameInsightsDropdown() {
	const dropdown = select('.reponav-item.reponav-dropdown');
	if (dropdown) {
		dropdown.firstChild.textContent = 'More ';
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

function addReleasesTab() {
	const $repoNav = $('.js-repo-nav');
	let $releasesTab = $repoNav.children('[data-selected-links~="repo_releases"]');
	const hasReleases = $releasesTab.length > 0;

	if (!hasReleases) {
		$releasesTab = $(`<a href="/${repoUrl}/releases" class="reponav-item reponav-releases" data-hotkey="g r" data-selected-links="repo_releases /${repoUrl}/releases">
			${icons.tag}
			<span>Releases</span>
		</a>`);
	}

	if (pageDetect.isReleases()) {
		$repoNav.find('.selected')
			.removeClass('js-selected-navigation-item selected');

		$releasesTab.addClass('js-selected-navigation-item selected');
	}

	if (!hasReleases) {
		$releasesTab.insertBefore(select('.reponav-dropdown, [data-selected-links~="repo_settings"]'));

		cacheReleasesCount();
	}
}

async function addTrendingMenuItem() {
	const secondListItem = await elementReady('.header-nav.float-left .header-nav-item:nth-child(2)');

	$(secondListItem).after(`
		<li class="header-nav-item">
			<a href="/trending" class="header-nav-link" data-hotkey="g t">Trending</a>
		</li>
	`);
}

function addYoursMenuItem() {
	const pageName = pageDetect.isIssueSearch() ? 'issues' : 'pulls';
	const username = getUsername();
	const menu = select('.subnav-links');

	if (select.exists('.refined-github-yours')) {
		return;
	}

	const yoursMenuItem = domify(`<a href="/${pageName}?q=is%3Aopen+is%3Aissue+user%3A${username}" class="subnav-item refined-github-yours">Yours</a>`);

	if (!select.exists('.subnav-links .selected') && location.search.includes(`user%3A${username}`)) {
		yoursMenuItem.classList.add('selected');
	}

	menu.appendChild(yoursMenuItem);
}

function addReadmeButtons() {
	const readmeContainer = select('#readme.readme');
	if (!readmeContainer) {
		return;
	}

	const buttons = domify('<div id="refined-github-readme-buttons"></div>');

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
		const button = domify(`<a class="tooltipped tooltipped-nw">${icons.tag}</a>`);
		button.href = `${releases.get(latestRelease)}#readme`;
		button.setAttribute('aria-label', `View this file at the latest version (${latestRelease})`);
		buttons.appendChild(button);
	}

	/**
	 * Generate Edit button
	 */
	if (select('.branch-select-menu i').textContent === 'Branch:') {
		const readmeName = select('#readme > h3').textContent.trim();
		const path = select('.breadcrumb').textContent.trim().split('/').slice(1).join('/');
		const currentBranch = select('.branch-select-menu .select-menu-item.selected').textContent.trim();
		const button = domify(`<a class="tooltipped tooltipped-nw" aria-label="Edit this file">${icons.edit}</a>`);
		button.href = `/${repoUrl}/edit/${currentBranch}/${path}${readmeName}`;
		buttons.appendChild(button);
	}

	readmeContainer.appendChild(buttons);
}

function addDeleteForkLink() {
	const postMergeDescription = select('#partial-pull-merging .merge-branch-description');

	if (postMergeDescription) {
		const currentBranch = postMergeDescription.querySelector('.commit-ref.current-branch');
		const forkPath = currentBranch ? currentBranch.title.split(':')[0] : null;

		if (forkPath && forkPath !== repoUrl) {
			$(postMergeDescription).append(
				`<p id="refined-github-delete-fork-link">
					<a href="/${forkPath}/settings">
						${icons.fork}
						Delete fork
					</a>
				</p>`
			);
		}
	}
}

function linkifyIssuesInTitles() {
	editTextNodes(linkifyIssues, select('.js-issue-title'));
}

function addPatchDiffLinks() {
	if (select.exists('.sha-block.patch-diff-links')) {
		return;
	}

	let commitUrl = location.pathname.replace(/\/$/, '');

	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	const $commitMeta = $('.commit-meta span.float-right');

	$commitMeta.append(`
		<span class="sha-block patch-diff-links">
			<a href="${commitUrl}.patch" class="sha">patch</a>
			<a href="${commitUrl}.diff" class="sha">diff</a>
		</span>
	`);
}

function removeDiffSigns() {
	$('.diff-table:not(.refined-github-diff-signs)')
		.addClass('refined-github-diff-signs')
		.find('.blob-code-inner')
		.each((index, el) => {
			el.firstChild.textContent = el.firstChild.textContent.slice(1);
		});
}

function markMergeCommitsInList() {
	for (const commit of select.all('.commits-list-item:not(.refined-github-merge-commit)')) {
		if (select.exists('[title^="Merge pull request"]', commit)) {
			const icon = domify(icons.mergedPullRequest);
			commit.classList.add('refined-github-merge-commit');
			commit.querySelector('.commit-avatar-cell').prepend(icon);
			commit.querySelector('.avatar').classList.add('avatar-child');
		}
	}
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
	if (select.exists('.recently-touched-branches-wrapper')) {
		return;
	}

	const codeURI = select('[data-hotkey="g c"]').getAttribute('href');

	const html = await fetch(codeURI, {
		credentials: 'include'
	}).then(res => res.text());

	// https://github.com/sindresorhus/refined-github/issues/216
	const isEmpty = select.exists('.blankslate, .js-git-clone-help-container', domify(html));
	if (!isEmpty) {
		const uri = `/${repoUrl}/show_partial?partial=tree/recently_touched_branches_list`;
		$(`<include-fragment src=${uri}></include-fragment>`).prependTo('.repository-content');
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

	container.insertAdjacentHTML('afterend', `
		<div class="diffbar-item refined-github-toggle-whitespace">
			<a href="${url}"
				data-hotkey="d w"
				class="btn btn-sm btn-outline BtnGroup-item tooltipped tooltipped-s ${hidingWhitespace ? 'bg-gray-light text-gray-light' : ''}"
				aria-label="${hidingWhitespace ? 'Show' : 'Hide'} whitespace in diffs">
				${hidingWhitespace ? icons.check : ''} No Whitespace
			</a>
		</div>
	`);
}

function addOPLabels() {
	const op = select('.gh-header .author').textContent.trim();
	const newComments = select
		.all(`.js-comment:not(.refined-github-op) strong .author[href="/${op}"]`)
		.map(author => author.closest('.js-comment'));

	if (newComments.length > 0) {
		const type = pageDetect.isPR() ? 'pull request' : 'issue';
		const tooltip = `${op === getUsername() ? 'You' : 'This user'} submitted this ${type}.`;
		const label = `
			<span class="timeline-comment-label tooltipped tooltipped-multiline tooltipped-s" aria-label="${tooltip}">
				Original&nbsp;Poster
			</span>
		`;

		const placeholders = select.all(`
			.timeline-comment .timeline-comment-header-text,
			.review-comment .comment-body
		`, newComments);

		for (const placeholder of placeholders) {
			placeholder.insertAdjacentHTML('beforeBegin', label);
		}

		for (const el of newComments) {
			el.classList.add('refined-github-op');
		}
	}
}

function addMilestoneNavigation() {
	$('.repository-content').before(`
		<div class="subnav">
			<div class="subnav-links float-left" role="navigation">
				<a href="/${repoUrl}/labels" class="subnav-item">Labels</a>
				<a href="/${repoUrl}/milestones" class="subnav-item">Milestones</a>
			</div>
		</div>
	`);
}

function addFilterCommentsByYou() {
	if (select.exists('.refined-github-filter')) {
		return;
	}
	const newFilter = `
		<a href="/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}" class="select-menu-item js-navigation-item refined-github-filter">
			<div class="select-menu-item-text">
				Everything commented by you
			</div>
		</a>`;
	select('.subnav-search-context .js-navigation-item:last-child')
		.insertAdjacentHTML('beforeBegin', newFilter);
}

function addProjectNewLink() {
	const projectNewLink = `<a href="/${repoUrl}/projects/new" class="btn btn-sm" id="refined-github-project-new-link">Add a project</a>`;
	if (select.exists('#projects-feature:checked') && !select.exists('#refined-github-project-new-link')) {
		$(`#projects-feature ~ p.note`).after(projectNewLink);
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

function init() {
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
			addReleasesTab();
			removeProjectsTab();
			addCompareLink();
			renameInsightsDropdown();
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
				filePathCopyBtnListner();
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
		});
	}
}

init();
