import {assert, test} from 'vitest';

import {setStatusFilter} from './extend-conversation-status-filters-helpers.js';

test('setStatusFilter removes draft filters before switching status', () => {
	const link = document.createElement('a');
	link.href = 'https://github.com/refined-github/refined-github/pulls?q=is:pr+state:draft+-label:WIP';

	assert.equal(
		setStatusFilter(link, 'state:open'),
		'https://github.com/refined-github/refined-github/pulls?q=is%3Apr+-label%3AWIP+state%3Aopen+',
	);
});

test('setStatusFilter clears legacy and modern draft filters', () => {
	const link = document.createElement('a');
	link.href = 'https://github.com/refined-github/refined-github/pulls?q=is:pr+is:draft+state:draft';

	assert.equal(
		setStatusFilter(link),
		'https://github.com/refined-github/refined-github/pulls?q=is%3Apr+',
	);
});
