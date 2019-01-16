import select from 'select-dom';
import delegate from 'delegate';
import features from '../libs/features';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		const dropdown = select(`
			.dropdown-details[open] summary,
			body.menu-active .modal-backdrop
		`);
		if (dropdown) {
			dropdown.click();
		}
	}
});

function init() {
	delegate('.dropdown-details, .js-menu-target', 'click', event => {
		const button = event.delegateTarget;
		const menu = button.closest('.select-menu, .dropdown, details');
		if (menu) {
			const modal = menu.querySelector('.select-menu-modal, .dropdown-menu');
			if (modal && (!button.open || button.classList.contains('selected'))) {
				observer.observe(modal);
			}
		}
	});
}

features.add({
	id: 'close-out-of-view-modals',
	init
});
