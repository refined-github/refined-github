import {$$} from 'select-dom';
import {assert, test} from 'vitest';

import {linksToConversationLists} from './selectors.js';

test('linksToConversationLists ignores issue labels settings links', () => {
	document.body.innerHTML = `
		<a href="https://github.com/refined-github/refined-github/issues">Issues</a>
		<a href="https://github.com/refined-github/refined-github/issues/labels">Edit labels</a>
		<a href="https://github.com/refined-github/refined-github/labels/bug">Bug label</a>
	`;

	const matchingLinks = $$(linksToConversationLists);

	assert.deepEqual(
		matchingLinks.map(link => link.href),
		[
			'https://github.com/refined-github/refined-github/issues',
			'https://github.com/refined-github/refined-github/labels/bug',
		],
	);
});
