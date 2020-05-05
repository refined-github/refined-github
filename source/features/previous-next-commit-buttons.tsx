import select from 'select-dom';
import features from '../libs/features';
import * as pageDetect from 'github-page-detection';

function init(): false | void {
	const originalPreviousNext = select('.commit .BtnGroup.float-right');
	if (!originalPreviousNext) {
		return false;
	}

	const previousNext = originalPreviousNext.cloneNode(true);
	const files = select('#files')!;

	files.after(previousNext);
}

features.add({
	id: __filebasename,
	description: 'Adds duplicate commit navigation buttons at the bottom of the `Commits` tab page.',
	screenshot: 'https://user-images.githubusercontent.com/24777/41755271-741773de-75a4-11e8-9181-fcc1c73df633.png'
}, {
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit
	],
	init
});
