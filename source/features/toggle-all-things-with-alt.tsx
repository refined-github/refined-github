import select from 'select-dom';
import features from '../libs/features';

function getSimilarItems(item: Element): Element[] {
	if (item.matches('.js-toggle-file-notes')) { // "Show/Hide comments" in PR files
		return select.all('.js-toggle-file-notes:checked');
	}

	return [];
}

function handleEvent(event: Event): void {
	console.log(event);

	if (!event.altKey) {
		return;
	}

	const target = event.target as Element;
	const clickedItem = target.tagName === 'INPUT' ? target : target.closest('button')!;
	const viewportOffset = clickedItem.parentNode!.getBoundingClientRect().top;

	const items = getSimilarItems(clickedItem);


	for (const eventItem of items) {
		if (eventItem !== clickedItem) {
			if (eventItem.tagName === 'INPUT' && (eventItem as HTMLInputElement).type === 'checkbox') {
				eventItem.checked = !eventItem.checked;
			}
		}
	}

	requestAnimationFrame(() => {
		const newOffset = clickedItem.parentNode!.getBoundingClientRect().top;
		window.scrollBy(0, newOffset - viewportOffset);
	});
}

function init(): void {
	const items = select.all([
		'.js-toggle-file-notes'
	].join(', '));

	for (const item of items) {
		if (item.tagName === 'INPUT') {
			item.addEventListener('change', handleEvent);
		} else {
			item.addEventListener('click', handleEvent);
		}
	}
}

features.add({
	id: 'toggle-all-things-with-alt',
	load: features.onAjaxedPages,
	init,
	description: 'Toggle all similar items while holding `alt`'
});
