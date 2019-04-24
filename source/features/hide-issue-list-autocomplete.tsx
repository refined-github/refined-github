import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	select('.subnav-search')!.setAttribute('autocomplete', 'off');
}

features.add({
	id: 'hide-issue-list-autocomplete',
	include: [
		features.isDiscussionList
	],
	load: features.onAjaxedPages,
	init
});
