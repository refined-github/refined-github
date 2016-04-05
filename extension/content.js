/* globals gitHubInjection, pageDetect, diffFileHeader, addReactionParticipants */
'use strict';
const [, ownerName, repoName] = location.pathname.split('/');
const repoUrl = `${ownerName}/${repoName}`;
const getUsername = () => $('meta[name="user-login"]').attr('content');

const uselessContent = {
	upvote: {text: ['+1\n'], emoji: [':+1:', ':100:', ':ok_hand:']},
	downvote: {text: ['-1\n'], emoji: [':-1:']}
};

function linkifyBranchRefs() {
	$('.commit-ref').each((i, el) => {
		const parts = $(el).find('.css-truncate-target');
		const branch = parts.eq(parts.length - 1).text();
		let username = ownerName;

		// if there are two parts the first part is the username
		if (parts.length > 1) {
			username = parts.eq(0).text();
		}

		$(el).wrap(`<a href="https://github.com/${username}/${repoName}/tree/${branch}">`);
	});
}

function commentIsUseless(type, el) {
	if (uselessContent[type].text.includes(el.innerText)) {
		return true;
	}
	// check if there is exactly one child element, that has one or two child nodes;
	// sometimes a second child node can contain a useless space
	// using `childNodes` because this also includes text nodes
	if (el.children.length === 1) {
		const children = el.children[0].childNodes;
		if (children.length === 1 || (children.length === 2 && !children[1].textContent.trim())) {
			const onlyChild = children[0];
			if (onlyChild.tagName === 'IMG' && uselessContent[type].emoji.includes(onlyChild.title)) {
				return true;
			}
		}
	}

	return false;
}

function renderVoteCount(type, voters) {
	let iconUrl;
	if (type === 'upvote') {
		iconUrl = 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png';
	}
	if (type === 'downvote') {
		iconUrl = 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44e.png';
	}
	const $sidebar = $('#partial-discussion-sidebar');
	let avatars = '';

	for (const val of voters) {
		avatars += val;
	}

	avatars = avatars.replace(/height="48"/g, 'height="20"')
										.replace(/width="48"/g, 'width="20"')
										.replace(/<a href/g, '<a class="participant-avatar" href')
										.replace(/timeline-comment-avatar/g, 'avatar');

	$sidebar.append(`<div class="discussion-sidebar-item">
			<div class="participation">
				<h3 class="discussion-sidebar-heading">
					${voters.size} <img class="emoji" alt="${type}" height="20" width="20" align="absmiddle" src="${iconUrl}">
				</h3>
				<div class="participation-avatars">
					${avatars}
				</div>
			</div>
		</div>`);
}

function moveVotes() {
	const upVoters = new Set();
	const downVoters = new Set();
	$('.js-comment-body').each((i, el) => {
		// this is a comment not in the usual container - found on inline comments
		if ($(el).closest('.js-comment-container').find('.author').length === 0) {
			return;
		}

		const isUp = commentIsUseless('upvote', el);
		const isDown = commentIsUseless('downvote', el);

		if (isUp || isDown) {
			// grab avatar and wrapping a tag for commenter
			const commenter = $($(el).closest('.js-comment-container').find('a').get(0)).wrap('<div>').parent().html();

			// remove from both arrays
			upVoters.delete(commenter);
			downVoters.delete(commenter);

			// add to upvoters if it's an upvote
			if (isUp) {
				upVoters.add(commenter);
			}

			// add to upvoters if it's an upvote
			if (isDown) {
				downVoters.add(commenter);
			}

			el.closest('.js-comment-container').remove();
		}
	});
	if (upVoters.size > 0) {
		renderVoteCount('upvote', upVoters);
	}
	if (downVoters.size > 0) {
		renderVoteCount('downvote', downVoters);
	}
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

function infinitelyMore() {
	const btn = $('.ajax-pagination-btn').get(0);

	// if there's no more button remove unnecessary event listeners
	if (!btn) {
		window.removeEventListener('scroll', infinitelyMore);
		window.removeEventListener('resize', infinitelyMore);
		return;
	}

	// grab dimensions to see if we should load
	const wHeight = window.innerHeight;
	const wScroll = window.pageYOffset || document.scrollTop;
	const btnOffset = $('.ajax-pagination-btn').offset().top;

	// smash the button if it's coming close to being in view
	if (wScroll > (btnOffset - wHeight)) {
		btn.click();
	}
}

function addBlameParentLinks() {
	$('.blame-sha').each((index, commitLink) => {
		const $commitLink = $(commitLink);
		const $blameParentLink = $commitLink.clone();
		const commitSha = /\w{40}$/.exec(commitLink.href)[0];

		$blameParentLink
			.text('Blame ^')
			.prop('href', location.pathname.replace(
				/(\/blame\/)[^\/]+/,
				`$1${commitSha}${encodeURI('^')}`
			));

		$commitLink.nextAll('.blame-commit-meta').append($blameParentLink);
	});
}

function addReadmeEditButton() {
	const readmeContainer = $('#readme');
	const readmeName = $('#readme > h3').text().trim();
	const currentBranch = $('.file-navigation .select-menu.left button.select-menu-button').attr('title');
	const editHref = `/${repoUrl}/edit/${currentBranch}/${readmeName}`;
	const editButtonHtml = `<div id="refined-github-readme-edit-link">
														<a href="${editHref}">
															<svg class="octicon octicon-pencil" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M0 12v3h3l8-8-3-3L0 12z m3 2H1V12h1v1h1v1z m10.3-9.3l-1.3 1.3-3-3 1.3-1.3c0.39-0.39 1.02-0.39 1.41 0l1.59 1.59c0.39 0.39 0.39 1.02 0 1.41z"></path></svg>
														</a>
													</div>`;

	readmeContainer.append(editButtonHtml);
}

function addDeleteForkLink() {
	const postMergeContainer = $('#partial-pull-merging');

	if (postMergeContainer.length > 0) {
		const postMergeDescription = $(postMergeContainer).find('.merge-branch-description').get(0);
		const forkPath = $(postMergeContainer).attr('data-channel').split(':')[0];

		if (forkPath !== repoUrl) {
			$(postMergeDescription).append(
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
	const commitMeta = $('.commit-meta span.right').get(0);

	$(commitMeta).append(`
		<span class="sha-block patch-diff-links">
			<a href="${commitUrl}.patch" class="sha">.patch</a>
			<a href="${commitUrl}.diff" class="sha">.diff</a>
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
	const indentSize = (size - el.selectionEnd % size) || size;
	const indentationText = ' '.repeat(indentSize);
	el.value = value.slice(0, selectionStart) + indentationText + value.slice(el.selectionEnd);
	el.selectionEnd = el.selectionStart = selectionStart + indentationText.length;
}

// Support indent with tab key in textarea elements
$(document).on('keydown', event => {
	// Check event.target instead of using a delegate, because Sprint doesn't support them
	if (!$(event.target).is('textarea')) {
		return;
	}

	if (event.which === 9) {
		event.preventDefault();
		indentInput(event.target);
		return false;
	}
});

// Prompt user to confirm erasing a comment with the Cancel button
$(document).on('click', event => {
	// Check event.target instead of using a delegate, because Sprint doesn't support them
	const $target = $(event.target);
	if (!$target.hasClass('js-hide-inline-comment-form')) {
		return;
	}

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

		// event binding for infinite scroll
		window.addEventListener('scroll', infinitelyMore);
		window.addEventListener('resize', infinitelyMore);
	}

	if (pageDetect.isRepo()) {
		gitHubInjection(window, () => {
			addReleasesTab();
			diffFileHeader.destroy();

			if (pageDetect.isPR()) {
				linkifyBranchRefs();
				addDeleteForkLink();
			}

			if (pageDetect.isPR() || pageDetect.isIssue()) {
				moveVotes();
				linkifyIssuesInTitles();
				addReactionParticipants(username);
				document.addEventListener('click', event => {
					reapplyReactionParticipants(event, username)
				});
			}

			if (pageDetect.isBlame()) {
				addBlameParentLinks();
			}

			if (pageDetect.isRepoRoot()) {
				addReadmeEditButton();
			}

			if (pageDetect.isCommit()) {
				addPatchDiffLinks();
			}

			if (pageDetect.isCommitList()) {
				markMergeCommitsInList();
			}

			if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
				diffFileHeader.setup();
			}
		});
	}
});
