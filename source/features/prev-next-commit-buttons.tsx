/*
When reviewing a long commit in a PR, it's annoying to have to scroll back to
the top of the page to hit the "Next" button to go to the next commit.

This feature duplicates the Prev/Next buttons and inserts them at the bottom of
the page too.
*/
import select from 'select-dom';
import features from '../libs/features';

function init() {
	const originalPrevNext = select('.commit .BtnGroup.float-right');
	if (!originalPrevNext) {
		return false;
	}

	const prevNext = originalPrevNext.cloneNode(true);
	const files = select('#files');

	files.after(prevNext);
}

features.add({
	id: 'prev-next-commit-buttons',
	include: [
		features.isPRFiles,
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
