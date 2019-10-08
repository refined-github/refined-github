import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	document.body.addEventListener('toggle', event => {
		const confirmButton = select<HTMLButtonElement>('[open] details-dialog [type="submit"]', event.target as HTMLElement);
		if (confirmButton) {
			setTimeout(() => {
				confirmButton.focus();
				document.body.classList.remove('intent-mouse'); // Without this, the :focus style isn't applied
			});
		}
	}, true); // The `toggle` event doesn't bubble, so it needs to be captured
}

features.add({
	id: __featureName__,
	description: 'Always focuses confirm buttons in custom modal boxes, like "Mark all as read".',
	screenshot: 'https://user-images.githubusercontent.com/1402241/31700158-1499bdd8-b38d-11e7-9aba-77a0a4b6bf3c.png',
	init
});
