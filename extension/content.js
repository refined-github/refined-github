/* globals gitHubInjection, pageDetect, diffFileHeader, addReactionParticipants, addFileCopyButton, enableCopyOnY, addBlameParentLinks, showRealNames */

'use strict';
const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
const repoUrl = `${ownerName}/${repoName}`;
const getUsername = () => $('meta[name="user-login"]').attr('content');

function linkifyBranchRefs() {
	$('.commit-ref').each((i, el) => {
		const $el = $(el);
		if ($el.children().eq(0).text() === 'unknown repository') {
			$el.addClass('unlinked');
			return;
		}

		const parts = $el.find('.css-truncate-target');
		const branch = encodeURIComponent(parts.eq(parts.length - 1).text());
		let username = ownerName;

		// if there are two parts the first part is the username
		if (parts.length > 1) {
			username = parts.eq(0).text();
		}

		$el.wrap(`<a href="https://github.com/${username}/${repoName}/tree/${branch}">`);
	});
}

function appendReleasesCount(count) {
	if (!count) {
		return;
	}

	$('.reponav-releases').append(`<span class="counter">${count}</span>`);
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

function addReleasesTab() {
	const $repoNav = $('.js-repo-nav');
	let $releasesTab = $repoNav.children('[data-selected-links~="repo_releases"]');
	const hasReleases = $releasesTab.length > 0;

	if (!hasReleases) {
		$releasesTab = $(`<a href="/${repoUrl}/releases" class="reponav-item reponav-releases" data-hotkey="g r" data-selected-links="repo_releases /${repoUrl}/releases">
			<svg class="octicon octicon-tag" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M6.73 2.73c-0.47-0.47-1.11-0.73-1.77-0.73H2.5C1.13 2 0 3.13 0 4.5v2.47c0 0.66 0.27 1.3 0.73 1.77l6.06 6.06c0.39 0.39 1.02 0.39 1.41 0l4.59-4.59c0.39-0.39 0.39-1.02 0-1.41L6.73 2.73zM1.38 8.09c-0.31-0.3-0.47-0.7-0.47-1.13V4.5c0-0.88 0.72-1.59 1.59-1.59h2.47c0.42 0 0.83 0.16 1.13 0.47l6.14 6.13-4.73 4.73L1.38 8.09z m0.63-4.09h2v2H2V4z"></path></svg>
			<span>Releases</span>
		</a>`);
	}

	if (pageDetect.isReleases()) {
		$repoNav.find('.selected')
			.removeClass('js-selected-navigation-item selected');

		$releasesTab.addClass('js-selected-navigation-item selected');
	}

	if (!hasReleases) {
		$repoNav.append($releasesTab);

		cacheReleasesCount();
	}
}

function addTrendingMenuItem() {
	const $secondListItem = $('.header-nav.left .header-nav-item:nth-child(2)');

	$secondListItem.after(`
		<li class="header-nav-item">
			<a href="/trending" class="header-nav-link" data-hotkey="g t">Trending</a>
		</li>
	`);
}

function infinitelyMore() {
	const $btn = $('.ajax-pagination-btn');

	// if there's no more button remove unnecessary event listeners
	if (!$btn.length) {
		$(window).off('scroll.infinite resize.infinite', infinitelyMore);
		return;
	}

	// grab dimensions to see if we should load
	const wHeight = window.innerHeight;
	const wScroll = window.pageYOffset || document.scrollTop;
	const btnOffset = $btn.offset().top;

	// smash the button if it's coming close to being in view
	if (wScroll > (btnOffset - wHeight)) {
		$btn.click();
	}
}

function addReadmeEditButton() {
	const $readmeContainer = $('#readme');
	if (!$readmeContainer.length) {
		return;
	}

	const readmeName = $('#readme > h3').text().trim();
	const path = $('.js-repo-root ~ .js-path-segment, .final-path').map((idx, el) => $(el).text()).get().join('/');
	const currentBranch = $('.file-navigation .select-menu.left button.select-menu-button span').text();
	const editHref = `/${repoUrl}/edit/${currentBranch}/${path ? `${path}/` : ''}${readmeName}`;
	const editButtonHtml = `<div id="refined-github-readme-edit-link">
		<a href="${editHref}">
			<svg class="octicon octicon-pencil" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M0 12v3h3l8-8-3-3L0 12z m3 2H1V12h1v1h1v1z m10.3-9.3l-1.3 1.3-3-3 1.3-1.3c0.39-0.39 1.02-0.39 1.41 0l1.59 1.59c0.39 0.39 0.39 1.02 0 1.41z"></path></svg>
		</a>
	</div>`;

	$readmeContainer.append(editButtonHtml);
}

function addDeleteForkLink() {
	const $postMergeContainer = $('#partial-pull-merging');

	if ($postMergeContainer.length > 0) {
		const $postMergeDescription = $postMergeContainer.find('.merge-branch-description');
		const forkPath = $postMergeContainer.attr('data-channel').split(':')[0];

		if (forkPath !== repoUrl) {
			$postMergeDescription.append(
				`<p id="refined-github-delete-fork-link">
					<a href="https://github.com/${forkPath}/settings">
						<svg aria-hidden="true" class="octicon octicon-repo-forked" height="16" role="img" version="1.1" viewBox="0 0 10 16" width="10"><path d="M8 1c-1.11 0-2 0.89-2 2 0 0.73 0.41 1.38 1 1.72v1.28L5 8 3 6v-1.28c0.59-0.34 1-0.98 1-1.72 0-1.11-0.89-2-2-2S0 1.89 0 3c0 0.73 0.41 1.38 1 1.72v1.78l3 3v1.78c-0.59 0.34-1 0.98-1 1.72 0 1.11 0.89 2 2 2s2-0.89 2-2c0-0.73-0.41-1.38-1-1.72V9.5l3-3V4.72c0.59-0.34 1-0.98 1-1.72 0-1.11-0.89-2-2-2zM2 4.2c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z m3 10c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z m3-10c-0.66 0-1.2-0.55-1.2-1.2s0.55-1.2 1.2-1.2 1.2 0.55 1.2 1.2-0.55 1.2-1.2 1.2z"></path></svg>
						Delete fork
					</a>
				</p>`
			);
		}
	}
}

function linkifyIssuesInTitles() {
	const $title = $('.js-issue-title');
	const titleText = $title.text();

	if (/(#\d+)/.test(titleText)) {
		$title.html(titleText.replace(
			/#(\d+)/g,
			`<a href="https://github.com/${repoUrl}/issues/$1">#$1</a>`
		));
	}
}

function addPatchDiffLinks() {
	if ($('.sha-block.patch-diff-links').length > 0) {
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
	el.selectionEnd = el.selectionStart = selectionStart + indentationText.length;
}

function showRecentlyPushedBranches() {
	// Don't duplicate on back/forward in history
	if ($('.recently-touched-branches-wrapper').length) {
		return;
	}

	const codeURI = $('[data-hotkey="g c"]').attr('href');

	fetch(codeURI, {
		credentials: 'include'
	}).then(res => res.text()).then(html => {
		const codeDOM = new DOMParser().parseFromString(html, 'text/html');
		const isEmpty = $(codeDOM).find('.blankslate').length;

		// https://github.com/sindresorhus/refined-github/issues/216
		if (isEmpty) {
			return;
		}

		const uri = `/${repoUrl}/show_partial?partial=tree/recently_touched_branches_list`;
		const fragMarkup = `<include-fragment src=${uri}></include-fragment>`;
		const div = document.createElement('div');
		div.innerHTML = fragMarkup;
		$('.repository-content').prepend(div);
	});
}

// Add option for viewing diffs without whitespace changes
function addDiffViewWithoutWhitespaceOption(type) {
	if ($('.diff-options-content').length < 1 && $('.btn-group .selected[href*="diff="]').length < 1) {
		return;
	}

	// Return if element already exists in DOM (history actions)
	if ($('.refined-github-toggle-whitespace').length > 0) {
		return;
	}

	const optionElement = document.createElement('a');
	const urlParams = new URLSearchParams(window.location.search);
	const urlHash = window.location.hash || '';
	const svgIcon = '<svg aria-hidden="true" class="octicon octicon-check" height="16" version="1.1" viewBox="0 0 12 16" width="12"><path d="M12 5L4 13 0 9l1.5-1.5 2.5 2.5 6.5-6.5 1.5 1.5z"></path></svg>';
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
		$('.diff-options-content').find('.dropdown-item:last-of-type').after(optionElement);
		optionElementObject.addClass('dropdown-item');
	} else {
		$('.btn-group .selected[href*="diff="]').after(optionElement);
		optionElementObject.addClass('btn btn-sm');
	}
}

// Support indent with tab key in comments
$(document).on('keydown', '.js-comment-field', event => {
	if (event.which === 9 && !event.shiftKey) {
		// don't indent if the suggester box is active
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

// Collapse file diffs when clicking the file header
$(document).on('click', event => {
	// Check event.target instead of using a delegate, because Sprint doesn't support them
	const $target = $(event.target);
	if (!($target.closest('.file-header').length > 0 && $target.closest('.file-actions').length === 0)) {
		return;
	}

	$target.closest('.js-details-container').toggleClass('refined-github-minimized');
});

document.addEventListener('DOMContentLoaded', () => {
	const username = getUsername();

	if (!pageDetect.isGist()) {
		addTrendingMenuItem();
	}

	if (pageDetect.isDashboard()) {
		// hide other users starring/forking your repos
		const hideStarsOwnRepos = () => {
			$('#dashboard .news .watch_started, #dashboard .news .fork')
				.has(`.title a[href^="/${username}"]`)
				.css('display', 'none');
		};

		hideStarsOwnRepos();

		new MutationObserver(() => hideStarsOwnRepos())
			.observe($('#dashboard .news').get(0), {childList: true});

		$(window).on('scroll.infinite resize.infinite', infinitelyMore);
	}

	if (pageDetect.isRepo()) {
		gitHubInjection(window, () => {
			addReleasesTab();
			diffFileHeader.destroy();
			enableCopyOnY.destroy();

			if (pageDetect.isPR()) {
				linkifyBranchRefs();
				addDeleteForkLink();
			}

			if (pageDetect.isPR() || pageDetect.isIssue()) {
				linkifyIssuesInTitles();
			}

			if (pageDetect.isBlame()) {
				addBlameParentLinks();
			}

			if (pageDetect.isRepoRoot() || pageDetect.isRepoTree()) {
				addReadmeEditButton();
			}

			if (pageDetect.isPRList() || pageDetect.isIssueList()) {
				showRecentlyPushedBranches();
			}

			if (pageDetect.isCommit()) {
				addPatchDiffLinks();
			}

			if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
				addReactionParticipants.add(username);
				addReactionParticipants.addListener(username);
				showRealNames();
			}

			if (pageDetect.isCommit() || pageDetect.isSingleCommit()) {
				addDiffViewWithoutWhitespaceOption('commit');
			}

			if (pageDetect.isCommitList()) {
				markMergeCommitsInList();
			}

			if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
				diffFileHeader.setup();
				addDiffViewWithoutWhitespaceOption('pr');
			}

			if (pageDetect.isSingleFile()) {
				addFileCopyButton();
				enableCopyOnY.setup();
			}
		});
	}
});
