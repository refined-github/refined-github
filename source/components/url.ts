import {readable} from 'svelte/store';

function stripHash(url: string): string {
	const u = new URL(url);
	u.hash = '';
	return u.href;
}

export const url = readable(stripHash(location.href), set => {
	const handler = (event: NavigateEvent): void => {
		set(stripHash(event.destination.url));
	};

	navigation.addEventListener('navigate', handler);
	return () => {
		navigation.removeEventListener('navigate', handler);
	};
});
