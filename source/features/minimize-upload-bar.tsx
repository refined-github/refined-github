import './minimize-upload-bar.css';
import * as pageDetect from 'github-url-detection';

import features from '.';
import cssOnlyFeature from '../helpers/css-only-feature';

void features.add(__filebasename, {
	include: [
		pageDetect.hasRichTextEditor
	],
	awaitDomReady: false,
	init: () => void cssOnlyFeature(__filebasename)
});
