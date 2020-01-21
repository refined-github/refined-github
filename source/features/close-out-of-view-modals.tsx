import delegate from 'delegate-it';
import features from '../libs/features';
import {logError} from '../libs/utils';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		target.closest('details')!.open = false;
	}
});

function init(): void {
	// The `open` attribute is added after this handler is run, so the selector is inverted
	delegate('.details-overlay:not([open]) > summary', 'click', ({delegateTarget: summary}) => {
		// The timeout gives the element time to "open"
		setTimeout(() => {
			const modalBox = summary.parentElement!.querySelector('.dropdown-menu')!;
			if (modalBox.getBoundingClientRect().width === 0) {
				logError(__featureName__, 'Modal element was not correctly detected for', summary);
				return;
			}

			observer.observe(modalBox);
		}, 100);
	});
}

features.add({
	id: __featureName__,
	description: 'Automatically closes dropdown menus when they’re no longer visible.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/37022353-531c676e-2155-11e8-96cc-80d934bb22e0.gif',
	init
});
