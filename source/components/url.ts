import {derived, readable} from 'svelte/store';

// Do not replace with `getCleanPathname`, we read the URL parameters too
function stripHash(url: string): string {
	const u = new URL(url);
	u.hash = '';
	return u.href;
}

const hrefStore = readable(stripHash(location.href), set => {
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

// Strings are compared by value, so `derived` only re-runs when the href actually changes
const urlStore = derived(hrefStore, href => new URL(href));

export default urlStore;
