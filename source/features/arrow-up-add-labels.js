import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate';

function changeSelection(from, to) {
	if (from && from.classList.contains('navigation-focus')) {
		from.classList.remove('navigation-focus');
		from.setAttribute('aria-selected', 'false');
		to.classList.add('navigation-focus');
		to.setAttribute('aria-selected', 'true');
	}
}

function eventHandler(event) {
	if (event.key === 'ArrowUp' || event.key === 'ArrowUp') {
		const items = select.all('.js-active-navigation-container .js-navigation-item:not([style*="display:"])');
		if (event.key === 'ArrowUp') {
			changeSelection(items[0], items[items.length - 1]);
		} else {
			changeSelection(items[items.length - 1], items[0]);
		}
		event.stopImmediatePropagation();
	}
}

export default onetime(() => {
	delegate('.select-menu-text-filter', 'keydown', eventHandler);
});
