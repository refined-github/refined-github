import {readable} from 'svelte/store';

function normalizeUrl(url: string): string {
	const parsed = new URL(url, location.origin);
	parsed.hash = '';
	return parsed.href;
}

export default readable(normalizeUrl(location.href), set => {
	let currentUrl = normalizeUrl(location.href);
	const update = (nextUrl = location.href): void => {
		const normalizedUrl = normalizeUrl(nextUrl);
		if (normalizedUrl !== currentUrl) {
			currentUrl = normalizedUrl;
			set(normalizedUrl);
		}
	};

	const onPopState = (): void => {
		update();
	};

	globalThis.addEventListener('popstate', onPopState);

	const onNavigate = (event: NavigateEvent): void => {
		update(event.destination.url);
	};

	if ('navigation' in globalThis) {
		navigation.addEventListener('navigate', onNavigate);
	}

	const originalPushState = history.pushState;
	history.pushState = (...arguments_: Parameters<History['pushState']>): void => {
		originalPushState.apply(history, arguments_);
		update();
	};

	const originalReplaceState = history.replaceState;
	history.replaceState = (...arguments_: Parameters<History['replaceState']>): void => {
		originalReplaceState.apply(history, arguments_);
		update();
	};

	return () => {
		history.pushState = originalPushState;
		history.replaceState = originalReplaceState;
		globalThis.removeEventListener('popstate', onPopState);
		if ('navigation' in globalThis) {
			navigation.removeEventListener('navigate', onNavigate);
		}
	};
});
