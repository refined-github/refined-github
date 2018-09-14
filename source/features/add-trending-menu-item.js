import {h} from 'dom-chef';
import * as pageDetect from '../libs/page-detect';
import {safeElementReady} from '../libs/utils';
import {registerShortcut} from './improve-shortcut-help';

export default async function () {
	const selectedClass = pageDetect.isTrending() ? 'selected' : '';
	const issuesLink = await safeElementReady('.HeaderNavlink[href="/issues"], .header-nav-link[href="/issues"]');
	if (!issuesLink) {
		return;
	}

	issuesLink.parentNode.after(
		<li class="header-nav-item">
			<a href="/trending" class={`js-selected-navigation-item HeaderNavlink px-lg-2 py-2 py-lg-0 ${selectedClass}`} data-hotkey="g t">Trending</a>
		</li>
	);
	registerShortcut('site', 'g t', 'Go to Trending');

	// Explore link highlights /trending urls by default, remove that behavior
	if (pageDetect.isTrending()) {
		const exploreLink = await safeElementReady('a[href="/explore"]');
		if (exploreLink) {
			exploreLink.classList.remove('selected');
		}
	}
}
