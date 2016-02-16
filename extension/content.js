/* globals gitHubInjection */
'use strict';
const path = location.pathname;
const isDashboard = path === '/';
const isRepo = /^\/[^/]+\/[^/]+/.test(path);
let repoName = path.split('/')[2];
const isPR = () => /^\/[^/]+\/[^/]+\/pull\/\d+$/.test(location.pathname);
const getUsername = () => $('meta[name="user-login"]').attr('content');

function linkifyBranchRefs() {
	$('.commit-ref').each((i, el) => {
		const parts = $(el).find('.css-truncate-target');
		let username = parts.eq(0).text();
		let branch = parts.eq(1).text();

		// forked repos can have their name changed; grab it from first commit in PR
		const forkName = document.querySelectorAll('.commit-id')[0].href.split('/')[4];

		// both branches are from the current repo
		if (!branch) {
			branch = username;
			username = getUsername();
		}

		// if this is the forked version, use the forked repo's name
		if (!path.includes(username))
			repoName = forkName

		$(el).wrap(`<a href="https://github.com/${username}/${repoName}/tree/${branch}">`);
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
		});
	}
});
