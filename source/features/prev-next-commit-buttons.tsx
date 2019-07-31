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
	id: __featureName__,
	description: 'Adds duplicate commit navigation buttons at the bottom of the `Commits` tab page.',
	screenshot: 'https://user-images.githubusercontent.com/24777/41755271-741773de-75a4-11e8-9181-fcc1c73df633.png',
	include: [
		features.isPRFiles,
		features.isPRCommit
	],
	load: features.onAjaxedPages,
	init
});
