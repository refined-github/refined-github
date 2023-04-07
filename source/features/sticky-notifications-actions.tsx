import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import './sticky-notifications-actions.css';
import selectHas from '../helpers/select-has.js';

const FILTER_BAR_SELECTOR = '.js-notifications-container .Box:has(.js-select-all-text)';
const CLASS_TO_ADD = 'rgh-sticky-notifications-actions';

function init(): void {
	const filterBox = selectHas(FILTER_BAR_SELECTOR);

	if (filterBox) {
		filterBox.classList.add(CLASS_TO_ADD);
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isNotifications,
	],
	init,
});
