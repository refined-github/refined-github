import './clean-repo-header.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url, [pageDetect.isRepoRoot]);

/*

## Test URLs

https://github.com/refined-github/refined-github

*/
