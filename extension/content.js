/* globals gitHubInjection */
'use strict';
const path = location.pathname;
const isDashboard = path === '/';
const isRepo = /^\/[^/]+\/[^/]+/.test(path);
const username = path.split('/')[1];
const repoName = path.split('/')[2];
const isPR = () => /^\/[^/]+\/[^/]+\/pull\/\d+$/.test(location.pathname);
const isReleases = () => isRepo && /^\/[^/]+\/[^/]+\/releases/.test(location.pathname);
const getUsername = () => $('meta[name="user-login"]').attr('content');

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

function addReleasesTab() {
	const releasesTabTemplate = '<span itemscope="" itemtype="http://schema.org/ListItem" itemprop="itemListElement">' +
		`<a href="/${username}/${repoName}/releases" class="reponav-item" data-hotkey="g r" data-selected-links="repo_releases /${username}/${repoName}/releases" itemprop="url">` +
			'<svg aria-hidden="true" class="octicon octicon-tag" height="16" role="img" version="1.1" viewBox="0 0 14 16" width="14"><path d="M6.73 2.73c-0.47-0.47-1.11-0.73-1.77-0.73H2.5C1.13 2 0 3.13 0 4.5v2.47c0 0.66 0.27 1.3 0.73 1.77l6.06 6.06c0.39 0.39 1.02 0.39 1.41 0l4.59-4.59c0.39-0.39 0.39-1.02 0-1.41L6.73 2.73zM1.38 8.09c-0.31-0.3-0.47-0.7-0.47-1.13V4.5c0-0.88 0.72-1.59 1.59-1.59h2.47c0.42 0 0.83 0.16 1.13 0.47l6.14 6.13-4.73 4.73L1.38 8.09z m0.63-4.09h2v2H2V4z"></path></svg>' +
			'&nbsp;<span itemprop="name">Releases</span>' +
			'<meta itemprop="position" content="6">' +
		'</a>' +
	'</span>';
	const $releasesTab = $(releasesTabTemplate);
	const $repoNav = $('.js-repo-nav');

	if (isReleases()) {
		$releasesTab.children('a')
			.addClass('js-selected-navigation-item selected');

		$repoNav.find('.selected')
			.removeClass('js-selected-navigation-item selected');
	}

	$repoNav.append($releasesTab);
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
			addReleasesTab();
			if (isPR()) {
				linkifyBranchRefs();
			}
		});
	}
});
