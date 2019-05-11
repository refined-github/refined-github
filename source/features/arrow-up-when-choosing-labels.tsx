/**
 * With this feature RGH will support cycled lists with keyboard support for arrow-up to navigate to the last item
 * when pressed at the first one and for arrow-down to navigate to the first item when pressed at the last one
 */
import select from 'select-dom';
import features from '../libs/features';

function swapLabelFocus(labels: HTMLElement[], from: number, to: number): void {
	labels[from].classList.remove('navigation-focus');
	labels[from].setAttribute('aria-selected', 'false');
	labels[to].classList.add('navigation-focus');
	labels[to].setAttribute('aria-selected', 'true');
}

function performSwapLabelBehaviour(event: KeyboardEvent, labels: HTMLElement[], from: number, to: number) {
	event.stopImmediatePropagation();
	event.preventDefault();
	swapLabelFocus(labels, from, to);
}

function init(): void {
	document.addEventListener('keydown', event => {
		const labels = select.all('.js-active-navigation-container .js-navigation-item');
		const lastLabelIndex = labels.length - 1;

		if (event.key === 'ArrowUp' && labels[0].classList.contains('navigation-focus')) {
			performSwapLabelBehaviour(event, labels, 0, lastLabelIndex);
		} else if (event.key === 'ArrowDown' && labels[lastLabelIndex].classList.contains('navigation-focus')) {
			performSwapLabelBehaviour(event, labels, lastLabelIndex, 0);
			select('.js-issue-labels-menu-content > .select-menu-list')!.scrollTop = 0;
		}
	});
}

features.add({
	id: 'arrow-up-when-choosing-labels',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
