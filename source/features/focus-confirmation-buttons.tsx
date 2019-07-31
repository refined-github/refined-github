import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	window.addEventListener('facebox:reveal', () => {
		select<HTMLButtonElement>('.facebox-content button')!.focus();
	});
}

features.add({
	id: __featureName__,
	description: 'Always focuses confirm buttons in custom modal boxes, like "Mark all as read".',
	screenshot: 'https://user-images.githubusercontent.com/1402241/31700158-1499bdd8-b38d-11e7-9aba-77a0a4b6bf3c.png',
	init
});
