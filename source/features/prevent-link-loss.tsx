import * as pageDetect from 'github-url-detection';
import {closestElement} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import Banner from './prevent-link-loss.svelte';

function attach(field: HTMLTextAreaElement): void {
	const target = closestElement([
		// Almost everywhere
		'fieldset',

		// Editing PR body
		'.CommentBox',
	], field);

	if (target instanceof HTMLFieldSetElement) {
		// On the new Markdown editor mounting a child directly inside the `fieldset` collapses
		// its height to 0, hiding the textarea entirely. Mounting as a sibling instead avoids the issues.
		// https://github.com/refined-github/refined-github/issues/9955
		mount(Banner, {
			target: target.parentElement!,
			anchor: target.nextSibling ?? undefined, props: {field},
		});

		return;
	}

	// Old Markdown editor doesn't have this bug, so we can keep mounting inside it.
	// This also preserve the extra margin for old views (PR)
	mount(Banner, {
		target,
		props: {field},
	});
}

function init(signal: AbortSignal): void {
	observe([
		'textarea.js-comment-field',
		'[class*="MarkdownInput-module__textArea"] textarea',
	], attach, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

Test content:

```
https://github.com/refined-github/refined-github/pull/6954/commits/32d1c8b2e1b6971709fe273cfdd1f959b51e8d85
https://github.com/refined-github/refined-github/pull/6954/changes/32d1c8b2e1b6971709fe273cfdd1f959b51e8d85..5d28ba424368606c7b241840cf4386f23ce66ec3
```

Test URLs:

New issue form: https://github.com/refined-github/refined-github/issues/new?assignees=&labels=bug&projects=&template=1_bug_report.yml
New comment form: https://github.com/refined-github/sandbox/issues/3
New review form: https://github.com/refined-github/sandbox/pull/4/files#review-changes-modal
New review comment form: https://github.com/refined-github/sandbox/pull/4/files

*/
