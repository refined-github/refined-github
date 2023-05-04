import {test, assert} from 'vitest';

import looseParseInt from './loose-parse-int.js';

test('looseParseInt', () => {
	assert.equal(looseParseInt('1,234'), 1234);
	assert.equal(looseParseInt('Bugs 1,234'), 1234);
	assert.equal(looseParseInt('5000+ issues'), 5000);
});
