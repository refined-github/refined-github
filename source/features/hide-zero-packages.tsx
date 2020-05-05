import elementReady from 'element-ready';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

async function init(): Promise<void> {
	const packagesCounter = await elementReady([
		'.numbers-summary [href$="/packages"] .num', // `isRepoRoot`
		'.UnderlineNav-item[href$="?tab=packages"] .Counter' // `isUserProfile`
	].join(','));

	if (packagesCounter?.textContent?.trim() === '0') {
		packagesCounter.closest('li, .UnderlineNav-item')!.remove();
	}
}

features.add({
	id: __filebasename,
	description: 'Hides the `Packages` tab if it’s empty (in repositories and user profiles).',
	screenshot: 'https://user-images.githubusercontent.com/35382021/62426530-688ef780-b6d5-11e9-93f2-515110aed1eb.jpg'
}, {
	include: [
		pageDetect.isRepoRoot,
		pageDetect.isUserProfile
	],
	waitForDomReady: false,
	init
});
