import {React} from 'dom-chef';
import features from '../libs/features';
import {isTrending} from '../libs/page-detect';
import {safeElementReady} from '../libs/utils';
import {registerShortcut} from './improve-shortcut-help';

async function init() {
	const selectedClass = isTrending() ? 'selected' : '';
	const issuesLink = await safeElementReady('.HeaderNavlink[href="/issues"], .header-nav-link[href="/issues"]');
	if (!issuesLink) {
		return false;
	}

	issuesLink.parentNode.after(
		<li class="header-nav-item">
			<a href="/trending" class={`js-selected-navigation-item HeaderNavlink px-lg-2 py-2 py-lg-0 ${selectedClass}`} data-hotkey="g t">Trending</a>
		</li>
	);
	registerShortcut('site', 'g t', 'Go to Trending');

	// Explore link highlights /trending urls by default, remove that behavior
	if (isTrending()) {
		const exploreLink = await safeElementReady('a[href="/explore"]');
		if (exploreLink) {
			exploreLink.classList.remove('selected');
		}
	}
}

features.add({
	id: 'trending-menu-item',
	exclude: [
		features.isGist
	],
	init
});
