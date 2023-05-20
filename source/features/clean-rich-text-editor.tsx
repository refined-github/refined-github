import select from 'select-dom';
import './clean-rich-text-editor.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';

const textInputSelectors = [
	'#issue_title',
	'#issue_form_repo',
	'#issue_form_description',
	'#issue_form_browser', // Id's for text input fields inside issues
	'#new_comment_field', // Id for text input field in comments
];

async function init(): Promise<void> {
	document.documentElement.classList.add('rgh-clean-rich-text-editor');
	// Hide unnecessary tooltips
	for (const textarea of select.all(textInputSelectors)) {
		textarea.title = '';
	}
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});

/*

## Test URLs

On create issue page
One PR https://github.com/refined-github/refined-github/issues/new?template=1_bug_report.yml

On an issue page
https://github.com/refined-github/refined-github/issues/6408

On discussion page
https://github.com/StrataSource/Portal-2-Community-Edition/discussions/706

*/
