import './align-issue-labels.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url, [pageDetect.isIssueOrPRList]);
void features.add(import.meta.url, {init() {
	console.log('sup');
}});
