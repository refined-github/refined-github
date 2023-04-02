import './next-prev-notifications.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addNextPreviousBtn(notificationsHeader: Element): void {
	notificationsHeader.parentElement?.parentElement?.classList.add('flex-items-between');
	const nextPreviousBtns = document.querySelector('.js-notifications-list-paginator-buttons')?.cloneNode(true);
	nextPreviousBtns?.classList.add('d-none', 'd-lg-flex');
	if (nextPreviousBtns) {
		notificationsHeader.parentElement?.parentElement?.appendChild(nextPreviousBtns);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('notification-filter', addNextPreviousBtn, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	awaitDomReady: true,
	init,
});
