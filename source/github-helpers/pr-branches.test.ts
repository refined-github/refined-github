import {test, assert} from 'vitest';

import {parseReferenceRaw} from './pr-branches.js';

test('parseReferenceRaw', () => {
	assert.deepEqual(parseReferenceRaw('fregante/mem:main', 'main'), {
		absolute: 'fregante/mem:main',
		relative: 'main',
		owner: 'fregante',
		name: 'mem',
		nameWithOwner: 'fregante/mem',
		branch: 'main',
	});
	assert.deepEqual(parseReferenceRaw('134130/refined-github:feature/#5942', '134130:feature/#5942'), {
		absolute: '134130/refined-github:feature/#5942',
		relative: '134130:feature/#5942',
		owner: '134130',
		name: 'refined-github',
		nameWithOwner: '134130/refined-github',
		branch: 'feature/#5942',
	});

	assert.throws(
		() => parseReferenceRaw('mem:main', 'main'),
		TypeError,
		'Expected `absolute` to be "user/repo:branch", got "mem:main"',
	);
	assert.throws(
		() => parseReferenceRaw('fregante/mem:main', 'fregante/mem'),
		TypeError,
		'Expected `relative` to be either "main" or "fregante:main", got "fregante/mem"',
	);
	assert.throws(
		() => parseReferenceRaw('fregante/mem:main', 'main:main'),
		TypeError,
		'Expected `relative` to be either "main" or "fregante:main", got "main:main"',
	);
});
