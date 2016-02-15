document.addEventListener('DOMContentLoaded', () => {
	'use strict';

	const username = document.querySelector('meta[name="user-login"]').getAttribute('content');

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
});
