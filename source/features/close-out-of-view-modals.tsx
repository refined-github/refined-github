import features from '.';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		target.closest('details')!.open = false;
	}
});

function menuActivatedHandler(event: CustomEvent): void {
	const details = event.target as HTMLElement;
	const modalBox = details.querySelector('details-menu')!;

	// Avoid silently breaking the interface: #2701
	if (modalBox.getBoundingClientRect().width === 0) {
		features.error(__filebasename, 'Modal element was not correctly detected for', details);
	} else {
		observer.observe(modalBox);
	}
}

function init(): void {
	document.addEventListener('menu:activated', menuActivatedHandler);
}

void features.add({
	id: __filebasename,
	description: 'Automatically closes dropdown menus when they’re no longer visible.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/37022353-531c676e-2155-11e8-96cc-80d934bb22e0.gif',
	testOn: ''
}, {
	awaitDomReady: false,
	init
});
