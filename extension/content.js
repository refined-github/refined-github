/* globals utils, gitHubInjection, pageDetect, icons, diffFileHeader, addReactionParticipants, addFileCopyButton, addGistCopyButton, enableCopyOnY, showRealNames, markUnread, linkifyURLsInCode, addUploadBtn, filePathCopyBtnListner, elementReady */

'use strict';
const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
const repoUrl = `${ownerName}/${repoName}`;
const getUsername = () => utils.el('meta[name="user-login"]').getAttribute('content');

function getCanonicalBranchFromRef($element) {
	const refSelector = '.commit-ref, .head-ref, .base-ref';

	return $element.find(refSelector).addBack(refSelector).filter('[title]').attr('title');
}

function getSettingsTab() {
	return $('.js-repo-nav > [data-selected-links~="repo_settings"]');
}

const hasSettings = () => getSettingsTab().length > 0;

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

		$el.wrap(`<a href="https://github.com/${branchUrl}">`);
	});
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
		const releasesCount = $('.numbers-summary a[href$="/releases"] .num').text().trim();
		appendReleasesCount(releasesCount);
		chrome.storage.local.set({[releasesCountCacheKey]: releasesCount});
	} else {
		chrome.storage.local.get(releasesCountCacheKey, items => {
			appendReleasesCount(items[releasesCountCacheKey]);
		});
	}
}

function addCompareTab() {
	const $repoNav = $('.js-repo-nav');

	if ($repoNav.find('.refined-github-compare-tab').length > 0) {
		return;
	}
	const $compareTab = $(`<a href="/${repoUrl}/compare" class="reponav-item refined-github-compare-tab">
		${icons.compare}
		<span>Compare</span>
	</a>`);

	if (pageDetect.isCompare()) {
		$repoNav.find('.selected').removeClass('js-selected-navigation-item selected');
		$compareTab.addClass('js-selected-navigation-item selected');
	}

	if (hasSettings()) {
		getSettingsTab().before($compareTab);
	} else {
		$repoNav.append($compareTab);
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
		if (hasSettings()) {
			getSettingsTab().before($releasesTab);
		} else {
			$repoNav.append($releasesTab);
		}

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
	const $menu = $('.subnav-links');

	if ($menu.find('.refined-github-yours').length > 0) {
		return;
	}

	const yoursMenuItem = $(`<a href="/${pageName}?q=is%3Aopen+is%3Aissue+user%3A${username}" class="subnav-item refined-github-yours">Yours</a>`);

	if ($('.subnav-links .selected').length === 0 && location.search.includes(`user%3A${username}`)) {
		yoursMenuItem.addClass('selected');
	}

	$menu.append(yoursMenuItem);
}

function infinitelyMore() {
	const btn = utils.el('.ajax-pagination-btn');

	// If there's no more button remove unnecessary event listeners
	if (!btn) {
		$(window).off('scroll.infinite resize.infinite', infinitelyMore);
		return;
	}

	// Grab dimensions to see if we should load
	const wHeight = window.innerHeight;
	const btnOffset = btn.getBoundingClientRect().top;

	// Smash the button if it's coming close to being in view
	if (wHeight > btnOffset) {
		btn.click();
	}
}

function addReadmeEditButton() {
	const readmeContainer = utils.el('#readme');
	if (readmeContainer) {
		return;
	}

	const readmeName = utils.el('#readme > h3').textContent.trim();
	const path = $('.js-repo-root ~ .js-path-segment, .final-path').get().map(el => el.textContent).join('/');
	const selectMenuButton = utils.el('.file-navigation .select-menu.float-left button.select-menu-button');
	const currentBranch = selectMenuButton.getAttribute('title') || selectMenuButton.querySelector('span').textContent;
	const editHref = `/${repoUrl}/edit/${currentBranch}/${path ? `${path}/` : ''}${readmeName}`;
	const editButtonHtml = `<div id="refined-github-readme-edit-link">
		<a href="${editHref}">
			${icons.edit}
		</a>
	</div>`;

	readmeContainer.append(editButtonHtml);
}

function addDeleteForkLink() {
	const postMergeDescription = utils.el('#partial-pull-merging .merge-branch-description');

	if (postMergeDescription) {
		const currentBranch = postMergeDescription.querySelector('.commit-ref.current-branch');
		const forkPath = currentBranch ? currentBranch.title.split(':')[0] : null;

		if (forkPath && forkPath !== repoUrl) {
			$(postMergeDescription).append(
				`<p id="refined-github-delete-fork-link">
					<a href="https://github.com/${forkPath}/settings">
						${icons.fork}
						Delete fork
					</a>
				</p>`
			);
		}
	}
}

function linkifyIssuesInTitles() {
	const title = utils.el('.js-issue-title');
	const titleText = utils.escapeHtml(title.textContent);
	const issueRegex = utils.issueRegex;

	if (issueRegex.test(titleText)) {
		title.innerHTML = titleText.replace(
			new RegExp(issueRegex.source, 'g'),
			match => utils.linkifyIssueRef(repoUrl, match, '')
		);
	}
}

function addPatchDiffLinks() {
	if (utils.exists('.sha-block.patch-diff-links')) {
		return;
	}

	let commitUrl = location.pathname.replace(/\/$/, '');

	if (pageDetect.isPRCommit()) {
		commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit');
	}

	const $commitMeta = $('.commit-meta span.right');

	$commitMeta.append(`
		<span class="sha-block patch-diff-links">
			<a href="${commitUrl}.patch" class="sha">patch</a>
			<a href="${commitUrl}.diff" class="sha">diff</a>
		</span>
	`);
}

function removeDiffSigns() {
	$('.blob-code-addition, .blob-code-deletion')
		.find('.blob-code-inner:not(.refined-github-diff-signs)')
		.each((index, element) => {
			const $element = $(element);
			$element.html(` ${$element.html().slice(1)}`);
			$element.addClass('refined-github-diff-signs');
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

function showRecentlyPushedBranches() {
	// Don't duplicate on back/forward in history
	if (utils.exists('.recently-touched-branches-wrapper')) {
		return;
	}

	const codeURI = utils.el('[data-hotkey="g c"]').getAttribute('href');

	fetch(codeURI, {
		credentials: 'include'
	}).then(res => res.text()).then(html => {
		const codeDOM = new DOMParser().parseFromString(html, 'text/html');
		const isEmpty = $(codeDOM).find('.blankslate').length || $(codeDOM).find('.js-git-clone-help-container').length;

		// https://github.com/sindresorhus/refined-github/issues/216
		if (isEmpty) {
			return;
		}

		const uri = `/${repoUrl}/show_partial?partial=tree/recently_touched_branches_list`;
		$(`<include-fragment src=${uri}></include-fragment>`).prependTo('.repository-content');
	});
}

// Add option for viewing diffs without whitespace changes
function addDiffViewWithoutWhitespaceOption(type) {
	if (!utils.exists('.diff-options-content') && !utils.exists('.btn-group .selected[href*="diff="]')) {
		return;
	}

	// Return if element already exists in DOM (history actions)
	if (utils.exists('.refined-github-toggle-whitespace')) {
		return;
	}

	const optionElement = document.createElement('a');
	const urlParams = new URLSearchParams(window.location.search);
	const urlHash = window.location.hash || '';
	const svgIcon = icons.check;
	const optionElementObject = $(optionElement);
	let optionIsSet = false;

	if (urlParams.get('w') === '1') {
		optionIsSet = true;
		urlParams.delete('w');
		optionElementObject.addClass('selected');
	} else {
		urlParams.set('w', 1);
	}

	const optionElementContent = `${optionIsSet ? svgIcon : ''} Ignore whitespace`;
	const optionHref = `${window.location.origin + window.location.pathname}?${urlParams.toString() + urlHash}`;

	optionElementObject.html(optionElementContent).attr('href', optionHref).attr('data-hotkey', 'd w').attr('class', 'refined-github-toggle-whitespace');

	if (type === 'pr') {
		$('.diff-options-content .dropdown-item:last-of-type').after(optionElement);
		optionElementObject.addClass('dropdown-item');
	} else {
		$('.btn-group .selected[href*="diff="]').after(optionElement);
		optionElementObject.addClass('btn btn-sm');
	}
}

function addOPLabels() {
	const comments = $('div.js-comment').toArray();
	const newComments = $(comments).filter(':not(.refined-github-op)').toArray();

	if (newComments.length > 0) {
		const commentAuthor = comment => comment.querySelector('strong .author').textContent;
		let op;

		if (pageDetect.isPR()) {
			const title = utils.el('title').textContent;
			const titleRegex = /^(.+) by (\S+) · Pull Request #(\d+) · (\S+)\/(\S+)$/;
			op = titleRegex.exec(title)[2];
		} else {
			op = commentAuthor(comments[0]);
		}

		let opComments = newComments.filter(comment => commentAuthor(comment) === op);

		if (!pageDetect.isPRFiles()) {
			opComments = opComments.slice(1);
		}

		if (opComments.length > 0) {
			const type = pageDetect.isPR() ? 'pull request' : 'issue';
			const tooltip = `${op === getUsername() ? 'You' : 'This user'} submitted this ${type}.`;
			const label = `
				<span class="timeline-comment-label tooltipped tooltipped-multiline tooltipped-s" aria-label="${tooltip}">
					Original Poster
				</span>
			`;

			$(opComments).filter('.timeline-comment').find('.timeline-comment-actions').after(label);
			$(opComments).filter('.review-comment').find('.comment-body').before(label);
		}

		$(newComments).addClass('refined-github-op');
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
	const newFilter = `
		<a href="/${repoUrl}/issues?q=is%3Aopen+commenter:${getUsername()}" class="select-menu-item js-navigation-item refined-github-filter">
			<div class="select-menu-item-text">
				Everything commented by you
			</div>
		</a>`;
	const lastFilter = $('.subnav-search-context .select-menu-list > a:last-child');
	if (!lastFilter.prev().hasClass('refined-github-filter')) {
		lastFilter.before(newFilter);
	}
}

function addProjectNewLink() {
	const projectNewLink = `<a href="/${repoUrl}/projects/new" class="btn btn-sm" id="refined-github-project-new-link">Add a project</a>`;
	if (utils.exists('#projects-feature:checked') && !utils.exists('#refined-github-project-new-link')) {
		$(`#projects-feature ~ p.note`).after(projectNewLink);
	}
}

function removeProjectsTab() {
	const projectsTab = utils.el('.js-repo-nav .reponav-item[data-selected-links^="repo_projects"]');
	if (projectsTab && projectsTab.querySelector('.Counter, .counter').textContent === '0') {
		projectsTab.remove();
	}
}

function fixSquashAndMergeTitle() {
	$('.btn-group-squash button[type=submit]').click(() => {
		const title = utils.el('.js-issue-title').textContent;
		const number = utils.el('.gh-header-number').textContent;
		utils.el('#merge_title_field').value = `${title.trim()} (${number})`;
	});
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
	const $target = $(event.target);

	// Do not prompt if textarea is empty
	const text = $target.closest('.js-inline-comment-form').find('.js-comment-field').val();
	if (text.length === 0) {
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

document.addEventListener('DOMContentLoaded', () => {
	const username = getUsername();

	markUnread.unreadIndicatorIcon();

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

		hideStarsOwnRepos();

		new MutationObserver(() => hideStarsOwnRepos())
			.observe(utils.el('#dashboard .news'), {childList: true});

		$(window).on('scroll.infinite resize.infinite', infinitelyMore);
	}

	if (pageDetect.isNotifications()) {
		markUnread.setup();

		new MutationObserver(() => {
			markUnread.destroy();

			if (pageDetect.isNotifications()) {
				markUnread.setup();
			}
		}).observe(utils.el('#js-pjax-container'), {childList: true});
	}

	addUploadBtn();
	new MutationObserver(addUploadBtn).observe(utils.el('div[role=main]'), {childList: true, subtree: true});

	if (pageDetect.isIssueSearch() || pageDetect.isPRSearch()) {
		addYoursMenuItem();
	}

	if (pageDetect.isRepo()) {
		gitHubInjection(window, () => {
			addReleasesTab();
			addCompareTab();
			removeProjectsTab();

			diffFileHeader.destroy();
			enableCopyOnY.destroy();
			markUnread.destroy();

			if (pageDetect.isPR()) {
				linkifyBranchRefs();
				addDeleteForkLink();
				fixSquashAndMergeTitle();
			}

			if (pageDetect.isPR() || pageDetect.isIssue()) {
				linkifyIssuesInTitles();
			}

			if (pageDetect.isRepoRoot() || pageDetect.isRepoTree()) {
				addReadmeEditButton();
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
				const diffElements = utils.el('.js-discussion, #files');
				if (diffElements) {
					new MutationObserver(removeDiffSigns).observe(diffElements, {childList: true, subtree: true});
				}
			}

			if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
				addReactionParticipants.add(username);
				addReactionParticipants.addListener(username);
				showRealNames();
			}

			if (pageDetect.hasDiff()) {
				addDiffViewWithoutWhitespaceOption('commit');
			}

			if (pageDetect.isCommitList()) {
				markMergeCommitsInList();
			}

			if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
				diffFileHeader.setup();
				addDiffViewWithoutWhitespaceOption('pr');
				filePathCopyBtnListner();
			}

			if (pageDetect.isSingleFile()) {
				addFileCopyButton();
				enableCopyOnY.setup();
			}

			if (pageDetect.isPR() || pageDetect.isIssue()) {
				markUnread.setup();
			}

			if (pageDetect.isIssue() || pageDetect.isPR()) {
				addOPLabels();

				new MutationObserver(addOPLabels).observe(utils.el('.new-discussion-timeline'), {childList: true, subtree: true});
			}

			if (pageDetect.isMilestone()) {
				addMilestoneNavigation();
			}

			if (pageDetect.hasCode()) {
				linkifyURLsInCode.linkifyCode(repoUrl);
			}

			if (pageDetect.isRepoSettings()) {
				addProjectNewLink();
			}
		});
	}
});

if (!pageDetect.isGist()) {
	addTrendingMenuItem();
}
