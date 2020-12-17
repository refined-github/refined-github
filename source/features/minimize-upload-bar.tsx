import './minimize-upload-bar.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	]
});