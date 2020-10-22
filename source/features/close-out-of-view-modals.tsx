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

void features.add(__filebasename, {
	awaitDomReady: false,
	init
});
