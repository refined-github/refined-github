import { readable } from 'svelte/store';

const stripHash = (url: string) => {
	const u = new URL(url);
	u.hash = '';
	return u.toString();
};

export const url = readable(stripHash(location.href), (set) => {
	const handler = (e: NavigateEvent) => set(stripHash(e.destination.url));
	navigation.addEventListener('navigate', handler);
	return () => navigation.removeEventListener('navigate', handler);
});
