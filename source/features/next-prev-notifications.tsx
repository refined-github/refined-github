import "./next-prev-notifications.css";
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addNextPrevBtn(notificationsHeader:Element):void {
    notificationsHeader.parentElement?.parentElement?.classList.add('flex-items-between')
    const nextPrevBtns = document.querySelector(".js-notifications-list-paginator-buttons")?.cloneNode(true);
    nextPrevBtns?.classList.add('d-none', 'd-lg-flex');
    nextPrevBtns && notificationsHeader.parentElement?.parentElement?.appendChild(nextPrevBtns);
}
async function init(signal: AbortSignal): Promise<void> {
    observe('notification-filter',addNextPrevBtn, {signal})
    
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});
