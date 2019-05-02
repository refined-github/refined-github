import select from 'select-dom';
import debounce from 'debounce-fn';
import domLoaded from 'dom-loaded';

const handlers = new Set<VoidFunction>();

const fragmentsLoaded = debounce(() => {
	// Safely run all callbacks
	handlers.forEach(async cb => cb());
}, {wait: 200});

function setup(): void {
	for (const fragment of select.all('include-fragment.diff-progressive-loader')) {
		// Remove any existing event listeners
		fragment.removeEventListener('load', fragmentsLoaded);

		fragment.addEventListener('load', fragmentsLoaded);
	}
}

export default async function (callback: VoidFunction): Promise<void> {
	setup();

	handlers.add(callback); // Add to callbacks for later use

	await domLoaded;
	callback(); // And call it initially
}
