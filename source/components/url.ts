import {readable} from 'svelte/store';

function normalizeUrl(url: string): string {
	const parsed = new URL(url, location.origin);
	parsed.hash = '';
	return parsed.href;
}

export default readable(normalizeUrl(location.href), set => {
	let currentUrl = normalizeUrl(location.href);

	if (!('navigation' in globalThis)) {
		return;
	}

	const update = (nextUrl: string): void => {
		const normalizedUrl = normalizeUrl(nextUrl);
		if (normalizedUrl !== currentUrl) {
			currentUrl = normalizedUrl;
			set(normalizedUrl);
		}
	};

	const onNavigate = (event: NavigateEvent): void => {
		update(event.destination.url);
	};

	navigation.addEventListener('navigate', onNavigate);

	return (): void => {
		navigation.removeEventListener('navigate', onNavigate);
	};
});
