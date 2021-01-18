import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const a of select.all('a[href$="/milestones"], a[href*="/milestones?"]')) {
		const searchParameters = new URLSearchParams(a.search);
		// Only if they aren't explicitly sorted differently
		if (!searchParameters.get('direction') && !searchParameters.get('sort')) {
			searchParameters.set('direction', 'asc');
			searchParameters.set('sort', 'due_date');
			a.search = String(searchParameters);
		}
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	init
});
