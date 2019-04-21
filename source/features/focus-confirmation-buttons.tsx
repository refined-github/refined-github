import select from 'select-dom';
import features from '../libs/features';

// Ensure that confirm buttons (like Mark all as read) are always in focus
function init(): void {
	window.addEventListener('facebox:reveal', () => {
		select<HTMLButtonElement>('.facebox-content button')!.focus();
	});
}

features.add({
	id: 'focus-confirmation-buttons',
	init
});
