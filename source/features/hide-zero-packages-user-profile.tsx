import select from 'select-dom';
import features from '../libs/features';
import {getUsername} from '../libs/utils';

function init(): void {
	const userProfilePackagesLabel = select(`div.user-profile-nav [href$="/${getUsername()}?tab=packages"]`);
	if (userProfilePackagesLabel) {
		if (select.last('span', userProfilePackagesLabel)?.textContent?.trim() === '0') {
			userProfilePackagesLabel.remove();
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Hides the `Packages` tab in the users profile if it’s empty.',
	screenshot: 'https://user-images.githubusercontent.com/35382021/62426530-688ef780-b6d5-11e9-93f2-515110aed1eb.jpg',
	include: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
