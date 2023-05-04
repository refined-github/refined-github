import {test, assert} from 'vitest';

import {getParsedBackticksParts} from './parse-backticks.js';

function parseBackticks(string: string): string {
	return getParsedBackticksParts(string).map(
		(part, index) => index % 2 && part.length > 0 ? `<code>${part.trim()}</code>` : part,
	).join('');
}

test('parseBackticks', () => {
	assert.equal(
		parseBackticks('multiple `code spans` between ` other ` text'),
		'multiple <code>code spans</code> between <code>other</code> text',
	);
	assert.equal(
		parseBackticks('`code` at the start'),
		'<code>code</code> at the start',
	);
	assert.equal(
		parseBackticks('code at the `end`'),
		'code at the <code>end</code>',
	);
	assert.equal(
		parseBackticks('single backtick in a code span: `` ` ``'),
		'single backtick in a code span: <code>`</code>',
	);
	assert.equal(
		parseBackticks('backtick-delimited string in a code span: `` `foo` ``'),
		'backtick-delimited string in a code span: <code>`foo`</code>',
	);
	assert.equal(
		parseBackticks('single-character code span: `a`'),
		'single-character code span: <code>a</code>',
	);
	assert.equal(
		parseBackticks(`
			triple-backtick multiline block
			\`\`\`
			foo
			bar
			\`\`\`
			in some text #3990
		`),
		`
			triple-backtick multiline block
			\`\`\`
			foo
			bar
			\`\`\`
			in some text #3990
		`,
	);
	assert.equal(
		parseBackticks(`
			empty triple-backtick block
			\`\`\`
			\`\`\`
		`),
		`
			empty triple-backtick block
			\`\`\`
			\`\`\`
		`,
	);
	assert.equal(
		parseBackticks(`
			triple-backtick code block
			\`\`\`
			foo
			bar
			\`\`\`
			in some text #3990
		`),
		`
			triple-backtick code block
			\`\`\`
			foo
			bar
			\`\`\`
			in some text #3990
		`,
	);
	assert.equal(
		parseBackticks(`
			hello\`
			\`world
		`),
		`
			hello\`
			\`world
		`,
	);
	assert.equal(
		parseBackticks(`
			hello\`\` red
			\`\`world
		`),
		`
			hello\`\` red
			\`\`world
		`,
	);
});
