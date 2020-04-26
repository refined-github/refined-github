import elementReady from 'element-ready';
import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from '../libs/page-detect';

async function init(): Promise<void> {
	const notificationsBar = await elementReady('.notifications-v2.notification-shelf', {
		stopOnDomReady: false,
		timeout: 2000
	});

	if (!notificationsBar) {
		return;
	}

	select.all('.js-notification-action form', notificationsBar).forEach(
		actionForm => actionForm.removeAttribute('data-redirect-to-inbox-on-submit')
	);
}

features.add({
	id: __filebasename,
	description: 'Stops redirecting to notification inbox from notification bar actions.',
	screenshot: 'https://user-images.githubusercontent.com/202916/80313046-ffae5900-87e8-11ea-87f3-ce2cf92e8db9.png'
}, {
	include: [
		pageDetect.isRepo
	],
	init
});
