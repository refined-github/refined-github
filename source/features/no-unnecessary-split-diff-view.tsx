import './no-unnecessary-split-diff-view.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function isUnifiedDiff(): boolean {
	// TODO: Maybe use this when available on isCompare
	// select.exists('meta[name="diff-view"][content="split"]'),
	return select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]', // Link in single commit
	]);
}

// TODO: Replace with CSS-only :has?
function init(): void {
	observe('.js-diff-table', diffTable => {
		for (const side of ['left', 'right']) {
			if (!select.exists(`[data-split-side="${side}"]:is(.blob-code-addition, .blob-code-deletion)`, diffTable)) {
				diffTable.setAttribute('data-rgh-hide-empty-split-diff-side', side);
				break;
			}
		}
	});
}

// Make sure the class names we need exist on the page #4483
const hasRequiredClasses = (): boolean => select.exists(`
	.js-diff-table
	:is(
		[data-split-side="left"],
		[data-split-side="right"]
	):is(
		.blob-code-addition,
		.blob-code-deletion
	)
`);

void features.add(import.meta.url, {
	asLongAs: [
		hasRequiredClasses,
		isUnifiedDiff,
		pageDetect.hasFiles,
	],
	init,
});

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
