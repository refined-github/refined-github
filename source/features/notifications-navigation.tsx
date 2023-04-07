import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function addNextPreviousBtn(navigationButtons: Element): void {
	select('notification-filter')!.closest('.d-flex')!.classList.add('flex-justify-between');
	const nextPreviousBtns = navigationButtons.cloneNode(true);
	nextPreviousBtns?.classList.add('d-none', 'ml-3', 'd-lg-flex');
	if (nextPreviousBtns) {
		select('notification-filter')!.closest('.d-flex')!.append(nextPreviousBtns);
	}
}

async function init(signal: AbortSignal): Promise<void> {
	observe('.js-notifications-list-paginator-buttons', addNextPreviousBtn, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});
