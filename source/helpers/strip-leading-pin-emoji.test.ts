import {assert, test} from 'vitest';

import stripLeadingPinEmoji from './strip-leading-pin-emoji.js';

test('strips a leading pin emoji', () => {
	assert.equal(stripLeadingPinEmoji('📌 Dependency Dashboard'), 'Dependency Dashboard');
	assert.equal(stripLeadingPinEmoji(' 📌  Dependency Dashboard'), 'Dependency Dashboard');
});

test('does not alter non-pin emoji', () => {
	assert.equal(stripLeadingPinEmoji('✅ Dependency Dashboard'), '✅ Dependency Dashboard');
});

test('does not alter non-leading pin emoji', () => {
	assert.equal(stripLeadingPinEmoji('Dependency 📌 Dashboard'), 'Dependency 📌 Dashboard');
});
