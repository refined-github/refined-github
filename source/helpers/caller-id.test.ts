import {test, assert} from 'vitest';

import {getStackLine} from './caller-id.js';

test('getCallerID: getStackLine', () => {
	assert.equal(getStackLine('A\nB', 0), 'A');
	assert.equal(getStackLine('A\nB', 1), 'B');

	assert.equal(getStackLine('Error: Get stack\nA\nB', 0), 'A');
	assert.equal(getStackLine('Error: Get stack\nA\nB', 1), 'B');

	assert.isTrue(getStackLine('Error: Get stack\nA\nB', 42).startsWith('0.'));
});
