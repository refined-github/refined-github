import './hide-repo-badges.css';
import * as pageDetect from 'github-url-detection';

import features from '.';

void features.addCssFeature(import.meta.url, [
	pageDetect.isRepo,
	pageDetect.isUserProfile,
], 'has-rgh');
