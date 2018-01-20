import select from 'select-dom';
import delegate from 'delegate';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		if (target.classList.contains('dropdown-menu') && select.exists('.dropdown-details[open]')) {
      // Close <details> dropdowns if it's still open
			select('.dropdown-details[open]').open = false;
		} else if (target.classList.contains('dropdown-menu') && select.exists('body.menu-active .modal-backdrop')) {
			// Close reponav dropdown
			select('.reponav-dropdown.active .reponav-item').click();
		} else if (target.classList.contains('js-active-navigation-container') || select.exists('.js-active-navigation-container', target)) {
			// Close .js-select-menu dropdowns if still open
			select('.select-menu-button.selected').click();
		}

		observer.unobserve(target);
	}
});

export default () => {
	// Observe all <details> based dropdown menus as well as reponav-dropdown
	delegate('.dropdown-details, .reponav-dropdown.js-menu-container', 'click', event => {
		const dropdownTarget = event.delegateTarget;
		const dropdownMenu = select('.dropdown-menu', dropdownTarget);

		if (dropdownMenu && !dropdownTarget.open) {
			observer.observe(dropdownMenu);
		}
	});

	// Observe all .js-select-menu based dropdowns
	delegate('.js-select-menu', 'click', event => {
		const dropdownTarget = event.delegateTarget;
		const dropdownMenu = select('.select-menu-modal-holder', dropdownTarget);

		if (dropdownMenu && dropdownTarget.classList.contains('active')) {
			observer.observe(dropdownMenu);
		}
	});
};
