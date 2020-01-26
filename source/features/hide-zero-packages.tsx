import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function hidePackageTabInRepo(): void {
	const packagesLabel = select('.numbers-summary [href$="/packages"]');
	if (packagesLabel?.textContent!.trim().startsWith('0')) {
		packagesLabel!.parentElement!.remove();
	}
}

function hidePackageTabInUserProfile(): void {
	const userProfilePackagesLabel = select(`div.user-profile-nav [href$="/${getUsername()}?tab=packages"]`);
	if (userProfilePackagesLabel) {
		if (select.last('span', userProfilePackagesLabel)?.textContent?.trim() === '0') {
			userProfilePackagesLabel.remove();
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Hides the `Packages` tab in repositories if it’s empty.',
	screenshot: 'https://user-images.githubusercontent.com/35382021/62426530-688ef780-b6d5-11e9-93f2-515110aed1eb.jpg',
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init: hidePackageTabInRepo
});

features.add({
	id: __featureName__,
	description: 'Hides the `Packages` tab in the users profile if it’s empty.',
	screenshot: 'https://user-images.githubusercontent.com/35382021/62426530-688ef780-b6d5-11e9-93f2-515110aed1eb.jpg',
	include: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init: hidePackageTabInUserProfile
});
