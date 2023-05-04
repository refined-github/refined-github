import './no-unnecessary-split-diff-view.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

void features.addCssFeature(import.meta.url, [
	pageDetect.hasFiles,
]);

/*

## Test URLs

### PR files

https://github.com/refined-github/sandbox/pull/50/files?diff=split

### PR files with annotations

https://github.com/fregante/sandbox/pull/30/files

### Compare page

https://github.com/refined-github/sandbox/compare/no-unnecessary-split-diff-view?expand=1&diff=split

### Single commit

https://github.com/refined-github/sandbox/commit/c28cc8e5271452b5b4c347d46a63f717c29417d6?diff=split

*/
