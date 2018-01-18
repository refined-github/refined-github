import select from 'select-dom';
import delegate from 'delegate';

// Observe all <details> based dropdown menus.
const observeDetails = () => {
	const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
		if (intersectionRatio === 0) {
			select('.dropdown-details[open]').open = false;
			observer.unobserve(target);
			console.log('Unobserved: ', target);
		}
	});

	delegate('.dropdown-details', 'click', event => {
		const dropdownDetails = event.delegateTarget;
		const dropdownMenu = select('.dropdown-menu', dropdownDetails);

		if (dropdownDetails.open) {
			observer.unobserve(dropdownMenu);
			console.log('Unobserved: ', dropdownMenu);
		} else {
			observer.observe(dropdownMenu);
			console.log('Observing: ', dropdownMenu);
		}
	});
}

// Observe all <a> based dropdown menus.
const observeAnchors = () => {
  // TODO
}

// Observe all <button> based dropdown menus.
const observeButtons = () => {
  // TODO
}

export default () => {
	observeDetails();
	observeAnchors();
	observeButtons();
};
