import features from '../libs/features';
import {isEditable} from '../libs/dom-utils';

function isLineSelected(): boolean {
	// Example hashes:
	// #L1
	// #L1-L7
	// #diff-1030ad175a393516333e18ea51c415caR1
	return /^#L|^#diff-[a-f0-9]+R\d+/.test(location.hash);
}

function listener(event: KeyboardEvent): void {
	if (
		event.key === 'Escape' && // Catch `Esc` key
		isLineSelected() &&
		!isEditable(event.target) // If a field isn’t focused
	) {
		location.hash = '#no-line'; // Update UI, without `scroll-to-top` behavior
		history.replaceState({}, document.title, location.pathname); // Drop remaining # from url
	}
}

function init(): void {
	document.body.addEventListener('keyup', listener);
}

features.add({
	id: __featureName__,
	description: 'Adds a keyboard shortcut to deselect the current line: `esc`.',
	screenshot: false,
	init
});
