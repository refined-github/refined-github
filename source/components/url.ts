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

	const onNavigate = (event: NavigateEvent): void => {
		set(normalizeUrl(event.destination.url));
	};

	navigation.addEventListener('navigate', onNavigate);

	return (): void => {
		navigation.removeEventListener('navigate', onNavigate);
	};
});
