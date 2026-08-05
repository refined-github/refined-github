import {assert, test} from 'vitest';

import {getBranches, parseReferenceRaw} from './pr-branches.js';

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

test('getBranches uses the reference title when the adjacent element is empty', () => {
	document.body.innerHTML = `
		<span class="base-ref" title="refined-github/refined-github:main">main</span>
		<span></span>
		<span class="head-ref" title="fregante/refined-github:feature/restore-file">fregante:feature/restore-file</span>
		<span></span>
	`;

	assert.deepEqual(getBranches(), {
		base: {
			absolute: 'refined-github/refined-github:main',
			relative: 'main',
			owner: 'refined-github',
			name: 'refined-github',
			nameWithOwner: 'refined-github/refined-github',
			branch: 'main',
		},
		head: {
			absolute: 'fregante/refined-github:feature/restore-file',
			relative: 'fregante:feature/restore-file',
			owner: 'fregante',
			name: 'refined-github',
			nameWithOwner: 'fregante/refined-github',
			branch: 'feature/restore-file',
		},
	});
});
