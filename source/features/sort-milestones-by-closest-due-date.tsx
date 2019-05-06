import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	for (const a of select.all<HTMLAnchorElement>('a[href$="/milestones"], a[href*="/milestones?"]')) {
		const searchParams = new URLSearchParams(a.search);
		// Only if they aren't explicitly sorted differently
		if (!searchParams.get('direction') && !searchParams.get('sort')) {
			searchParams.set('direction', 'asc');
			searchParams.set('sort', 'due_date');
			a.search = String(searchParams);
		}
	}
}

features.add({
	id: 'sort-milestones-by-closest-due-date',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
