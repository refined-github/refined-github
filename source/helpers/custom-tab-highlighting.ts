import select from 'select-dom';

export function notifyCustomTabAdded(tabName: string): void {
	document.dispatchEvent(new CustomEvent(tabName + '-tab-added'));
}

function onCustomTabAdded(tabName: string, callback: (customTab: HTMLElement) => void): VoidFunction {
	const tabSelector = `.rgh-${tabName}-tab`;
	const controller = new AbortController();
	document.addEventListener(tabName + '-tab-added', () => {
		controller.abort();
		callback(select(tabSelector)!);
	}, {
		signal: controller.signal,
	});

	const tabElement = select(tabSelector);
	if (tabElement) {
		controller.abort();
		callback(tabElement);
	}

	return controller.abort;
}

export function highlightCustomTab(tabName: string): VoidFunction {
	return onCustomTabAdded(tabName, (customTab: HTMLElement) => {
		customTab.classList.add('selected');
		customTab.setAttribute('aria-current', 'page');
	});
}

export function remove(tabElement: Element): void {
	tabElement.classList.remove('selected');
	tabElement.removeAttribute('aria-current');
}
