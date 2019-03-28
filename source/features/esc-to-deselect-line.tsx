import features from '../libs/features';

function isLineSelected(): boolean {
	// Example hashes:
	// #L1
	// #L1-L7
	// #diff-1030ad175a393516333e18ea51c415caR1
	return /^#L|^#diff-[a-f0-9]+R\d+/.test(location.hash);
}

function listener(event: KeyboardEvent) {
	if (
		event.key === 'Escape' && // Catch `Esc` key
		isLineSelected() &&
		!(event.target as Element).closest('textarea, input') // If a field isn’t focused
	) {
		location.hash = '#no-line'; // Update UI, without `scroll-to-top` behavior
		history.replaceState({}, document.title, location.pathname); // Drop remaining # from url
	}
}

function init() {
	document.body.addEventListener('keyup', listener);
}

features.add({
	id: 'esc-to-deselect-line',
	description: 'Press `esc` to deselect the current line when viewing files',
	init
});
