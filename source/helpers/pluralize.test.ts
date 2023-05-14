import {test, assert} from 'vitest';

import pluralize from './pluralize.js';

test('pluralize', () => {
	assert.equal(pluralize(0, 'A number', '$$ numbers'), '0 numbers');
	assert.equal(pluralize(0, 'A number', '$$ numbers', 'No numbers'), 'No numbers');
	assert.equal(pluralize(1, 'A number', '$$ numbers', 'No numbers'), 'A number');
	assert.equal(pluralize(2, 'A number', '$$ numbers', 'No numbers'), '2 numbers');
	assert.equal(pluralize(2, 'A number', 'Many numbers', 'No numbers'), 'Many numbers');
});
