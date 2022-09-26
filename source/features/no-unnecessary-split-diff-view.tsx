import './no-unnecessary-split-diff-view.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

void features.addCssFeature(import.meta.url, [
	pageDetect.hasFiles,
]);

/*

## Test URLs
### Right side only

https://github.com/sindresorhus/refined-github/pull/4296/files?diff=split

### Left side only

https://github.com/sindresorhus/refined-github/pull/3637/files?diff=split

### Single-side split diffs & regular split diffs

https://github.com/sindresorhus/refined-github/pull/4382/files?diff=split

### Compare page

https://github.com/sindresorhus/refined-github/compare/main...cheap-glitch:add-hide-empty-split-diff-side?diff=split

### Single commit

https://github.com/sindresorhus/refined-github/commit/3b1359ea465ff5c4d3f0f79e2d6781c7ce9a8283?diff=split

*/
