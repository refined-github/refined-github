import {test, assert} from 'vitest';

import isCurrentPageLink from './is-current-page-link.js';

test('isCurrentPageLink', () => {
	location.href = 'https://github.com/refined-github/refined-github/issues/9077#issuecomment-1';

	const selfLink = {
		href: 'https://github.com/refined-github/refined-github/issues/9077#issuecomment-2',
	};
	assert.isTrue(isCurrentPageLink(selfLink));

	location.href = 'https://github.com/refined-github/refined-github/issues/9078';
	assert.isFalse(isCurrentPageLink(selfLink));

	const otherLink = {
		href: 'https://github.com/refined-github/refined-github/issues/9078',
	};
	assert.isTrue(isCurrentPageLink(otherLink));
});
