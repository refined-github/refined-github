import features from '../libs/features';
import {getEventDelegator} from '../libs/dom-utils';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		target.closest('details').open = false;
	}
});

function init() {
	// The `open` attribute is added after this handler is run,
	// so the selector is inverted
	document.addEventListener('click', event => {
		const delegateTarget = getEventDelegator(event, '.details-overlay:not([open]) > summary');
		if (!delegateTarget) {
			return;
		}

		// What comes after <summary> is the dropdown
		observer.observe(delegateTarget.nextElementSibling);
	});
}

features.add({
	id: 'close-out-of-view-modals',
	init
});
