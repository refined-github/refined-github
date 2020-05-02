import './clean-notifications.css';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

function init(): void {
	// Check if dropdown exists and the group by 'repositories' is applied
	const dropdown = select('.js-check-all-container .dropdown');
	if (dropdown && select('summary', dropdown)?.textContent?.trim().endsWith('Repository')) {
		document.querySelector('.js-notifications-container')?.classList.add('rgh-clean-notifications');
	}
}

features.add({
	id: __filebasename,
	description: 'Removes redundant user/repo from notifications when being grouped by repository',
	screenshot: 'https://user-images.githubusercontent.com/37769974/80862883-0419bc80-8c96-11ea-84a7-15baf1eac0e6.png'
}, {
	include: [
		pageDetect.isNotifications
	],
	init
});
