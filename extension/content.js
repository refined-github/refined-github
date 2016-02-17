/* globals gitHubInjection */
'use strict';
const path = location.pathname;
const isDashboard = path === '/';
const isRepo = /^\/[^/]+\/[^/]+/.test(path);
const repoName = path.split('/')[2];
const isPR = () => /^\/[^/]+\/[^/]+\/pull\/\d+$/.test(location.pathname);
const isIssue = () => /^\/[^/]+\/[^/]+\/issues\/\d+$/.test(location.pathname);
const getUsername = () => $('meta[name="user-login"]').attr('content');
const uselessContent = {
	like: {text: ['+1\n'], emoji: [':+1:']},
	dislike: {text: ['-1\n'], emoji: [':-1:']}
};

function linkifyBranchRefs() {
	$('.commit-ref').each((i, el) => {
		const parts = $(el).find('.css-truncate-target');
		let username = parts.eq(0).text();
		let branch = parts.eq(1).text();

		// forked repos can have their name changed; grab it from first commit in PR
		const branchRepo = path.includes(username) ? repoName : $('.commit-id').attr('href').split('/')[2];

		// both branches are from the current repo
		if (!branch) {
			branch = username;
			username = getUsername();
		}

		$(el).wrap(`<a href="https://github.com/${username}/${branchRepo}/tree/${branch}">`);
	});
}

function commentIsUseless(type, el) {
	if (uselessContent[type].text.indexOf(el.innerText) >= 0) {
		return true;
	}
	// check if there is exactly one child element, that has one other child node
	// using `childNodes` because this also includes text
	if (el.children.length === 1 && el.children[0].childNodes.length === 1) {
		const onlyChild = el.children[0].childNodes[0];
		if (onlyChild.tagName === 'IMG' && uselessContent[type].emoji.indexOf(onlyChild.title) >= 0) {
			return true;
		}
	}
}

function renderLikeCount(type, count) {
	const sidebar = document.querySelector('#partial-discussion-sidebar');
	const likeElement = document.createElement('div');
	const likeHeading = document.createElement('h3');

	likeElement.className = 'discussion-sidebar-item';
	likeHeading.className = 'discussion-sidebar-heading';
	likeHeading.textContent = count + ' ' + type;
	likeElement.appendChild(likeHeading);
	sidebar.appendChild(likeElement);
}

function moveLikes() {
	let likeCount = 0;
	let dislikeCount = 0;
	$('.js-comment-body').each((i, el) => {
		const isLike = commentIsUseless('like', el);
		const isDislike = commentIsUseless('dislike', el);

		if (isLike || isDislike) {
			const commentContainer = el.closest('.js-comment-container');
			commentContainer.parentNode.removeChild(commentContainer);

			likeCount += isLike ? 1 : 0;
			dislikeCount += isDislike ? 1 : 0;
		}
	});
	if (likeCount > 0) {
		renderLikeCount('likes', likeCount);
	}
	if (dislikeCount > 0) {
		renderLikeCount('dislikes', dislikeCount);
	}
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

		// expand all the news feed pages
		(function more() {
			const btn = $('.ajax-pagination-btn').get(0);

			if (!btn) {
				return;
			}

			btn.click();
			setTimeout(more, 200);
		})();
	}

	if (isRepo) {
		gitHubInjection(window, () => {
			if (isPR()) {
				linkifyBranchRefs();
			}
			if (isPR() || isIssue()) {
				moveLikes();
			}
		});
	}
});
