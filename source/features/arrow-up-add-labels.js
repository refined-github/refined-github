import select from 'select-dom';
import delegate from 'delegate';

function changeSelection(labels, fromIndex, toIndex) {
	labels[fromIndex].classList.remove('navigation-focus');
	labels[fromIndex].setAttribute('aria-selected', 'false');
	labels[toIndex].classList.add('navigation-focus');
	labels[toIndex].setAttribute('aria-selected', 'true');
}

export default function () {
	delegate('.label-select-menu', '.js-issue-labels-menu-content', 'keydown', event => {
		const labels = select.all('.label-select-menu .select-menu-item:not([hidden])');
		if (event.key === 'ArrowUp' && labels[0].classList.contains('navigation-focus')) {
			changeSelection(labels, 0, labels.length - 1);
			event.stopImmediatePropagation();
			event.preventDefault();
		} else if (event.key === 'ArrowDown' && labels[labels.length - 1].classList.contains('navigation-focus')) {
			changeSelection(labels, labels.length - 1, 0);
			event.stopImmediatePropagation();
			event.preventDefault();
		}
	});
}
