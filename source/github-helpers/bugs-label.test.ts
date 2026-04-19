import {assert, test} from 'vitest';

import isBugLabel from './bugs-label.js';

const supportedLabels = `
bug
bug-fix
bugfix
confirmed-bug
type/bug
type:bug
type-bug
kind/bug
kind:bug
kind-bug
triage/bug
triage:bug
Issue-Bug
:bug:bug
:bug: bug
🐛bug
🐛 bug
`;

const blockedLabels = `
bugfixes
bugtracker
bug-report
bug-hunt
bugzilla
debug
debugger
bugatti
bugia
ladybug
not-a-bug
`;

test('isBugLabel', () => {
	for (const label of supportedLabels.trim().split('\n')) {
		assert.isTrue(isBugLabel(label), label + ' is a bug label');
	}

	for (const label of blockedLabels.trim().split('\n')) {
		assert.isFalse(isBugLabel(label), label + ' is a not bug label');
	}
});
