import './hide-watch-and-fork-count.css';
import * as pageDetect from 'github-url-detection';

import features from '.';
import cssOnlyFeature from '../helpers/css-only-feature';

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo
	],
	awaitDomReady: false,
	init: () => void cssOnlyFeature(__filebasename)
});
