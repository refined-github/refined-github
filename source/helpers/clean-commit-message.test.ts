import {assert, test} from 'vitest';

import cleanCommitMessage from './clean-commit-message.js';

test('cleanCommitMessage', () => {
	const coauthors = [
		'Co-authored-by: Me <me@example.com>',
		'co-authored-by: Me <me@example.com>',
		'Co-authored-by: You <you@example.com>',
	];
	const signoffs = [
		'Signed-off-by: Me <me@example.com>',
		'signed-off-by: Me <me@example.com>',
	];
	assert.isEmpty(cleanCommitMessage(''));
	assert.isEmpty(cleanCommitMessage('clean me'));
	assert.isEmpty(cleanCommitMessage(`
		multi-line
	`));

	assert.equal(
		cleanCommitMessage(`
		Some stuff happened
		${coauthors[0]}
	`),
		coauthors[0],
		'Should preserve just the co-authors',
	);

	assert.equal(
		cleanCommitMessage(`
		Some stuff happened
		${coauthors[0]}
		Fixes #112345
		${coauthors[2]}
	`),
		coauthors[0] + '\n' + coauthors[2],
		'Should preserve multiple co-authors',
	);

	assert.equal(
		cleanCommitMessage(`
		Some stuff happened
		${coauthors[0]}
		More stuff
		${coauthors[1]}
	`),
		coauthors[0],
		'Should de-duplicate inconsistent co-authored-by casing',
	);

	assert.equal(
		cleanCommitMessage(`
		Some stuff happened
		${signoffs[0]}
	`),
		signoffs[0],
		'Should preserve signed-off-by',
	);

	assert.equal(
		cleanCommitMessage(`
		Some stuff happened
		${signoffs[0]}
		${signoffs[1]}
	`),
		signoffs[0],
		'Should de-duplicate inconsistent signed-off-by casing',
	);

	assert.equal(
		cleanCommitMessage(`
		Some stuff happened
		${coauthors[0]}
		${signoffs[0]}
	`),
		coauthors[0] + '\n' + signoffs[0],
		'Should preserve both co-authored-by and signed-off-by',
	);

	assert.isEmpty(
		cleanCommitMessage(`
		Fixes #1345
	`),
		'Should drop closing keywords',
	);

	assert.equal(
		cleanCommitMessage(
			`
		Fixes #1345
	`,
			true,
		),
		'Fixes #1345',
		'Should keep closing keywords when asked',
	);
	assert.equal(
		cleanCommitMessage(
			`
		Fixes #1
		${coauthors[0]}
		closes https://github.com/refined-github/refined-github/pull/6328
	`,
			true,
		),
		[
			coauthors[0],
			'Fixes #1',
			'closes https://github.com/refined-github/refined-github/pull/6328',
		].join('\n'),
		'Should keep multiple closing keywords',
	);
});
