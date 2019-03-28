import delegate from 'delegate-it';
import features from '../libs/features';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		target.closest('details').open = false;
	}
});

function init() {
	// The `open` attribute is added after this handler is run,
	// so the selector is inverted
	delegate('.details-overlay:not([open]) > summary', 'click', event => {
		// What comes after <summary> is the dropdown
		observer.observe(event.delegateTarget.nextElementSibling);
	});
}

features.add({
	id: 'close-out-of-view-modals',
	description: 'Automatically close modals when they’re no longer visible',
	init
});
