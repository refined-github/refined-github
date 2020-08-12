import onetime from 'onetime';

import features from '.';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		target.closest('details')!.removeAttribute('open');
	}
});

function init(): void {
	document.addEventListener('menu:activated', ((event: CustomEvent) => {
		observer.observe((event.target as HTMLElement).querySelector('details-menu')!);
	}) as EventListener);
}

void features.add({
	id: __filebasename,
	description: 'Automatically closes dropdown menus when they’re no longer visible.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/37022353-531c676e-2155-11e8-96cc-80d934bb22e0.gif'
}, {
	waitForDomReady: false,
	init: onetime(init)
});
