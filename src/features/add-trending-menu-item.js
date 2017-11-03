import {h} from 'dom-chef';
import * as pageDetect from '../libs/page-detect';
import {safeElementReady} from '../libs/utils';

export default async function () {
	const selectedClass = pageDetect.isTrending() ? 'selected' : '';
	const issuesLink = await safeElementReady('.HeaderNavlink[href="/issues"], .header-nav-link[href="/issues"]');
	issuesLink.parentNode.after(
		<li class="header-nav-item">
			<a href="/trending" class={`js-selected-navigation-item HeaderNavlink header-nav-link px-2 ${selectedClass}`} data-hotkey="g t">Trending</a>
		</li>
	);

	// Explore link highlights /trending urls by default, remove that behavior
	if (pageDetect.isTrending()) {
		const exploreLink = await safeElementReady('a[href="/explore"]').catch(() => null);
		if (exploreLink) {
			exploreLink.classList.remove('selected');
		}
	}
}

