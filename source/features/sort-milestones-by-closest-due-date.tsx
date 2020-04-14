import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	for (const a of select.all<HTMLAnchorElement>('a[href$="/milestones"], a[href*="/milestones?"]')) {
		const searchParameters = new URLSearchParams(a.search);
		// Only if they aren't explicitly sorted differently
		if (!searchParameters.get('direction') && !searchParameters.get('sort')) {
			searchParameters.set('direction', 'asc');
			searchParameters.set('sort', 'due_date');
			a.search = String(searchParameters);
		}
	}
}

features.add({
	id: __featureName__,
	description: 'Changes the default sort order of milestones `Closest due date`.',
	screenshot: false
}, {
	include: [
		features.isRepo
	],
	init
});
