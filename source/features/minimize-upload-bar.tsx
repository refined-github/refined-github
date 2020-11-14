import './minimize-upload-bar.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void {
	for (const commentForm of select.all('.js-previewable-comment-form')) {
		commentForm.classList.add('rgh-minimize-upload-bar');
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	init
});
