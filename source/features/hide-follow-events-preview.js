import select from 'select-dom';
import {observeEl} from '../libs/utils';

// Hide the preview of follow events in dashboard
export default function () {
	observeEl('#dashboard .news', () => {
		for (const item of select.all('#dashboard .news .follow .body .border')) {
			item.style.display = 'none';
		}
	});
}
