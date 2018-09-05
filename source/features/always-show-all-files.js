import {h} from 'dom-chef';
import select from 'select-dom';

export default async function() {
	const button = select('.js-details-target');

	if (button) {
		button.click();
	}
}
