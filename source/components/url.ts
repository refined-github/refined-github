import {readable} from 'svelte/store';

// Do not replace with `getCleanPathname`, we read the URL parameters too
function stripHash(url: string): URL {
	const u = new URL(url);
	u.hash = '';
	return u;
}

const urlStore = readable(stripHash(location.href), set => {
	let current = stripHash(location.href);

	// The first value might be set before any subscribers appear.
	// The first subscriber will then call this function, but receive the cached value instead of the real URL.
	// This updates the value immediately.
	set(current);

	const handler = (event: NavigateEvent): void => {
		const next = stripHash(event.destination.url);
		if (next.href !== current.href) {
			current = next;
			set(next);
		}
	};

	navigation.addEventListener('navigate', handler);
	return () => {
		navigation.removeEventListener('navigate', handler);
	};
});

export default urlStore;
