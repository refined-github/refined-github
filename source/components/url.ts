import {readable} from 'svelte/store';

function normalizeUrl(url: string): string {
	const parsed = new URL(url, location.origin);
	parsed.hash = '';
	return parsed.href;
}

const initialUrl = normalizeUrl(location.href);

export default readable(initialUrl, set => {
	if (!('navigation' in globalThis)) {
		return;
	}

	let currentUrl = initialUrl;

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
