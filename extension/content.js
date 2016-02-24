/* globals gitHubInjection */
'use strict';
const path = location.pathname;
const isDashboard = path === '/' || /(^\/(dashboard))/.test(path) || /(^\/(orgs)\/)(\w|-)+\/(dashboard)/.test(path);
const isRepo = /^\/[^/]+\/[^/]+/.test(path);
const ownerName = path.split('/')[1];
const repoName = path.split('/')[2];
const isPR = () => /^\/[^/]+\/[^/]+\/pull\/\d+$/.test(location.pathname);
const isIssue = () => /^\/[^/]+\/[^/]+\/issues\/\d+$/.test(location.pathname);
const isReleases = () => isRepo && /^\/[^/]+\/[^/]+\/(releases|tags)/.test(location.pathname);
const getUsername = () => $('meta[name="user-login"]').attr('content');
const uselessContent = {
	upvote: {text: ['+1\n'], emoji: [':+1:']},
	downvote: {text: ['-1\n'], emoji: [':-1:']}
};

function linkifyBranchRefs() {
	$('.commit-ref').each((i, el) => {
		const parts = $(el).find('.css-truncate-target');
		let branch = parts.eq(parts.length - 1).text();
		let username = ownerName;

		// if there are two parts the first part is the username
		if (parts.length > 1) {
			username = parts.eq(0).text();
		}

		// forked repos can have their name changed; grab it from first commit in PR
		const branchRepo = path.includes(username) ? repoName : $('.commit-id').attr('href').split('/')[2];

		$(el).wrap(`<a href="https://github.com/${username}/${branchRepo}/tree/${branch}">`);
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
}

function renderVoteCount(type, count) {
	let iconUrl;
	if (type === 'upvote') {
		iconUrl = 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png';
	}
	if (type === 'downvote') {
		iconUrl = 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44e.png';
	}
	const $sidebar = $('#partial-discussion-sidebar');
	$sidebar.append(`<div class="discussion-sidebar-item">
			<h3 class="discussion-sidebar-heading">
				${count} <img class="emoji" alt="${type}" height="20" width="20" align="absmiddle" src="${iconUrl}">
			</h3>
		</div>`);
}

function moveVotes() {
	let upCount = 0;
	let downCount = 0;
	$('.js-comment-body').each((i, el) => {
		const isUp = commentIsUseless('upvote', el);
		const isDown = commentIsUseless('downvote', el);

		if (isUp || isDown) {
			el.closest('.js-comment-container').remove();

			upCount += isUp ? 1 : 0;
			downCount += isDown ? 1 : 0;
		}
	});
	if (upCount > 0) {
		renderVoteCount('upvote', upCount);
	}
	if (downCount > 0) {
		renderVoteCount('downvote', downCount);
	}
}

function addReleasesTab() {
	const $repoNav = $('.js-repo-nav');
	let $releasesTab = $repoNav.children('[data-selected-links~="repo_releases"]');
	const hasReleases = $releasesTab.length > 0;

	if (!hasReleases) {
		$releasesTab = $(`<a href="/${ownerName}/${repoName}/releases" class="reponav-item" data-hotkey="g r" data-selected-links="repo_releases /${ownerName}/${repoName}/releases">
			<svg class="octicon octicon-tag" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path d="M6.73 2.73c-0.47-0.47-1.11-0.73-1.77-0.73H2.5C1.13 2 0 3.13 0 4.5v2.47c0 0.66 0.27 1.3 0.73 1.77l6.06 6.06c0.39 0.39 1.02 0.39 1.41 0l4.59-4.59c0.39-0.39 0.39-1.02 0-1.41L6.73 2.73zM1.38 8.09c-0.31-0.3-0.47-0.7-0.47-1.13V4.5c0-0.88 0.72-1.59 1.59-1.59h2.47c0.42 0 0.83 0.16 1.13 0.47l6.14 6.13-4.73 4.73L1.38 8.09z m0.63-4.09h2v2H2V4z"></path></svg>
			Releases
		</a>`);
	}

	if (isReleases()) {
		$repoNav.find('.selected')
			.removeClass('js-selected-navigation-item selected');

		$releasesTab.addClass('js-selected-navigation-item selected');
	}

	if (!hasReleases) {
		$repoNav.append($releasesTab);
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

function addEditButtons() {
	var dirListItems = $('tr.js-navigation-item');

	dirListItems.each((index, element) => {
		// Add edit link to each list item.

		var isFile = $(element).find('td.icon > svg.octicon-file-text').size() === 1;
		if (isFile) {
			var editHref = $(element).find('td.content > span > a').attr('href').replace('blob', 'edit');
			var editButtonHtml =
				'<td class="icon" style="padding-left:9px;">' +
					'<a href="' + editHref + '">' +
						'<svg aria-hidden="true" class="octicon octicon-pencil" height="16" role="img" version="1.1" viewBox="0 0 14 16" width="14">' +
							'<path d="M0 12v3h3l8-8-3-3L0 12z m3 2H1V12h1v1h1v1z m10.3-9.3l-1.3 1.3-3-3 1.3-1.3c0.39-0.39 1.02-0.39 1.41 0l1.59 1.59c0.39 0.39 0.39 1.02 0 1.41z">' +
							'</path>' +
						'</svg>' +
					'</a>' +
				'</td>';
			$(element).children("td.icon").replaceWith(editButtonHtml);
		}
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const username = getUsername();

	if (isDashboard) {
		// hide other users starring/forking your repos
		{
			const hideStarsOwnRepos = () => {
				$('#dashboard .news .watch_started, #dashboard .news .fork')
					.has(`.title a[href^="/${username}"`)
					.css('display', 'none');
			};

			hideStarsOwnRepos();

			new MutationObserver(() => hideStarsOwnRepos())
				.observe($('#dashboard .news').get(0), {childList: true});
		}

		// event binding for infinite scroll
		window.addEventListener('scroll', infinitelyMore);
		window.addEventListener('resize', infinitelyMore);
	}

	if (isRepo) {
		gitHubInjection(window, () => {
			const isRepoTree = window.location.href.split('/').length === 5 || window.location.href.split('/')[5] === 'tree';

			addReleasesTab();

			if (isPR()) {
				linkifyBranchRefs();
			}
			if (isPR() || isIssue()) {
				moveVotes();
			}
			if (isRepoTree) {
				addEditButtons();
			}
		});
	}
});
