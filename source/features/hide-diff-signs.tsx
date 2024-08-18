import './hide-diff-signs.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url, [
	pageDetect.hasCode,
	pageDetect.isEditingFile,
]);

/*

Test URLs:

- PR files: https://github.com/refined-github/refined-github/pull/1783/files
- Commits: https://github.com/refined-github/refined-github/commit/24a802e93203fecb5644cc0a0f40ef0d1dba2359
- Code in PR reviews: https://github.com/refined-github/sandbox/pull/38
- Preview tab on Edit file page: https://github.com/refined-github/refined-github/edit/main/.editorconfig

*/
