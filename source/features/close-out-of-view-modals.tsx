import onetime from 'onetime';
import delegate from 'delegate-it';

import features from '.';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		target.closest('details')!.open = false;
	}
});

function init(): void {
	// The `open` attribute is added after this handler is run, so the selector is inverted
	delegate(document, '.details-overlay:not([open]) > summary[aria-haspopup="menu"]', 'click', ({delegateTarget: summary}) => {
		// The timeout gives the element time to "open"
		setTimeout(() => {
			const modalBox = summary.parentElement!.querySelector('details-menu')!;
			if (modalBox.getBoundingClientRect().width === 0) {
				features.error(__filebasename, 'Modal element was not correctly detected for', summary);
				return;
			}

			observer.observe(modalBox);
		}, 100);
	});
}

void features.add({
	id: __filebasename,
	description: 'Automatically closes dropdown menus when they’re no longer visible.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/37022353-531c676e-2155-11e8-96cc-80d934bb22e0.gif'
}, {
	waitForDomReady: false,
	init: onetime(init)
});
