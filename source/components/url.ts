import {readable} from 'svelte/store';

// Do not replace with `getCleanPathname`, we read the URL parameters too
function stripHash(url: string): string {
	const u = new URL(url);
	u.hash = '';
	return u.href;
}

const urlStore = readable(stripHash(location.href), set => {
	// The first value might be set before any subscribers appear.
	// The first subscriber will then call this function, but receive the cached value instead of the real URL.
	// This updates the value immediately.
	set(stripHash(location.href));

	const handler = (event: NavigateEvent): void => {
		set(stripHash(event.destination.url));
	};

	navigation.addEventListener('navigate', handler);
	return () => {
		navigation.removeEventListener('navigate', handler);
	};
});

export default urlStore;
