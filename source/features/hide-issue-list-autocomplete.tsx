import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	select('.subnav-search')!.setAttribute('autocomplete', 'off');
}

features.add({
	id: __featureName__,
	description: 'The autocomplete on the issue search field is removed',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
