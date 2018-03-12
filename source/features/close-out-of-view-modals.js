import select from 'select-dom';
import delegate from 'delegate';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		select(`
			.dropdown-details[open] summary,
			body.menu-active .modal-backdrop
		`).click();
	}
});

export default function () {
	delegate(`
		.dropdown-details,
		.js-menu-target
	`, 'click', event => {
		const button = event.delegateTarget;
		const modal = button
			.closest('.js-menu-container, .dropdown')
			.querySelector('.js-menu-content, .dropdown-menu');
		if (modal && (!button.open || button.classList.contains('selected'))) {
			observer.observe(modal);
		}
	});
}
