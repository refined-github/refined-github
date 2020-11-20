import debounceFn from 'debounce-fn';
import features from '.';

const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
	if (intersectionRatio === 0) {
		observer.unobserve(target);
		shouldClose(target);
	}
});

const shouldClose = debounceFn((target: Element) => {
	const details = target.closest('details')!
	const visibleChildren = getVisibleChildren(details);
	if (visibleChildren.length === 0) {
		details.open = false;
	} else {
		observeAll(visibleChildren);
	}
}, {wait: 100});

function observeAll(targets: Element[]): void {
	for (const child of targets) {
		observer.observe(child);
	}
}

function getVisibleChildren(details: HTMLDetailsElement): Element[] {
	const visible = [];
	for (const possibleModal of details.children) {
		if (possibleModal.tagName !== 'SUMMARY') {
			const rect = possibleModal.getBoundingClientRect();
			if (rect.width + rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight) {
				visible.push(possibleModal);
			}
		}
	}

	return visible;
}

function menuActivatedHandler(event: CustomEvent): void {
	const details = event.target as HTMLDetailsElement;
	const visibleChildren = getVisibleChildren(details);
	if (visibleChildren.length === 0) {
		features.error(__filebasename, 'Modal element was not correctly detected for', details);
	} else {
		observeAll(visibleChildren);
	}
}

function init(): void {
	document.addEventListener('menu:activated', menuActivatedHandler);
}

void features.add(__filebasename, {
	awaitDomReady: false,
	init
});
