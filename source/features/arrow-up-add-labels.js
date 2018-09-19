import select from 'select-dom';
import delegate from 'delegate';

let alreadySet = false;

function changeSelection(from, to) {
	if (from && from.classList.contains('navigation-focus')) {
		from.classList.remove('navigation-focus');
		from.setAttribute('aria-selected', 'false');
		to.classList.add('navigation-focus');
		to.setAttribute('aria-selected', 'true');
	}
}

export default function () {
	if (alreadySet) {
		return;
	}

	delegate('.js-navigation-container', 'keydown', event => {
		const labels = select.all('.js-active-navigation-container .js-navigation-item');
		if (event.key === 'ArrowUp') {
			changeSelection(labels[0], labels[labels.length - 1]);
		} else if (event.key === 'ArrowDown') {
			changeSelection(labels[labels.length - 1], labels[0]);
		}
	});

	alreadySet = true;
}
