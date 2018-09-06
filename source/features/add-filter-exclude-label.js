/*
This feature adds a way to exclude labels by clicking on them with the alt key pressed
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

const getLabelName = item => {
	const name = select('.name', item);
	return name ? name.innerText : '';
};

export default function () {
	const menu = select('.label-select-menu .select-menu-modal .js-select-menu-deferred-content');

	const addItemListener = () => {
		const items = select.all('a.label-select-menu-item', menu);

		items.forEach(item => {
			const name = getLabelName(item);

			const url = new URL(item.href);
			const query = url.searchParams.get('q') || '';
			const negated = query.replace(new RegExp(`(label:"?${name}"?)`), '-$1');
			url.searchParams.set('q', negated);

			item.addEventListener('click', event => {
				if (event.altKey) {
					event.preventDefault();
					window.location.href = url.href;
				}
			});
		});
	};

	observeEl(menu, addItemListener);
}
