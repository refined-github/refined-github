import {afterEach, assert, test} from 'vitest';

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

afterEach(() => {
	document.body.replaceChildren();
});

test.each([
	['current', 'summaryContainer__6Iz7T9', 'branchName__a15saO', 'branchName__a15saO'],
	[
		'previous',
		'PullRequestHeaderSummary-module__summary',
		'PullRequestBranchName-module__name',
		'PullRequestBranchName-module__name',
	],
	['legacy', '', 'base-ref', 'head-ref'],
])('getBranches with %s PR header', (_name, containerClass, baseClass, headClass) => {
	document.body.innerHTML = `
		<div class="${containerClass}">
			<a class="${baseClass}" data-component="BranchName">apache:master</a>
			<span>apache/ozone:master</span>
			<div>
				<a class="${headClass}" data-component="BranchName">smengcl:HDDS-17027-flaky</a>
				<span>smengcl/hadoop-ozone:HDDS-17027-flaky</span>
			</div>
		</div>
	`;

	const {base, head} = getBranches();
	assert.deepEqual(base, parseReferenceRaw('apache/ozone:master', 'apache:master'));
	assert.deepEqual(head, parseReferenceRaw('smengcl/hadoop-ozone:HDDS-17027-flaky', 'smengcl:HDDS-17027-flaky'));
});
