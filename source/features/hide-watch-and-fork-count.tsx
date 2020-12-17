import './hide-watch-and-fork-count.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(__filebasename, {
	include: [
		pageDetect.isRepo
	]
});
