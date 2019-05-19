import select from 'select-dom';
import features from '../libs/features';

function init(): false | void {
	const originalPrevNext = select('.commit .BtnGroup.float-right');
	if (!originalPrevNext) {
		return false;
	}

	const prevNext = originalPrevNext.cloneNode(true);
	const files = select('#files')!;

	files.after(prevNext);
}

features.add({
	id: 'prev-next-commit-buttons',
	description: 'Navigate PR commits with Previous/Next buttons at the bottom of the page',
	include: [
		features.isPRFiles,
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
