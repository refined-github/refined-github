'use strict';
const path = location.pathname;
const isDashboard = path === '/';
const isRepo = /^\/.*\/.*\//.test(location.pathname)
const isPR = () => /^\/.*\/.*\/pull\/\d+$/.test(location.pathname);
const repoName = path.split('/')[2];

function linkifyBranchRefs() {
	$('.commit-ref').each((i, el) => {
		const parts = $(el).find('.css-truncate-target');
		const username = parts.eq(0).text();
		const branch = parts.eq(1).text();
		$(el).wrap(`<a href="https://github.com/${username}/${repoName}/tree/${branch}">`);
	});
}

document.addEventListener('DOMContentLoaded', () => {
	const username = document.querySelector('meta[name="user-login"]').getAttribute('content');

	if (isDashboard) {
		// hide other users starring/forking your repos
		{
			const hideStarsOwnRepos = () => {
				const items = Array.from(document.querySelectorAll('#dashboard .news .watch_started, #dashboard .news .fork'));

				for (const item of items) {
					if (item.querySelector('.title a[href^="/' + username + '"')) {
						item.style.display = 'none';
					}
				}
			};

			hideStarsOwnRepos();

			new MutationObserver(() => hideStarsOwnRepos())
				.observe(document.querySelector('#dashboard .news'), {childList: true});
		}

		// expand all the news feed pages
		(function more() {
			const btn = document.querySelector('.ajax-pagination-btn');

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
