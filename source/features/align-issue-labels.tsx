import './align-issue-labels.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url, [pageDetect.isIssueOrPRList]);

/*

# Test URLs

https://github.com/pulls
https://github.com/bmish/eslint-doc-generator/pulls
https://github.com/bmish/eslint-doc-generator/issues
https://github.com/bmish/eslint-doc-generator/milestone/1

*/
