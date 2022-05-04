import test from 'ava';

import {getParsedBackticksParts} from './parse-backticks';

function parseBackticks(string: string): string {
	return getParsedBackticksParts(string).map(
		(part, index) => index % 2 && part.length > 0 ? `<code>${part.trim()}</code>` : part,
	).join('');
}

test('parseBackticks', t => {
	t.is(
		parseBackticks('multiple `code spans` between ` other ` text'),
		'multiple <code>code spans</code> between <code>other</code> text',
	);
	t.is(
		parseBackticks('`code` at the start'),
		'<code>code</code> at the start',
	);
	t.is(
		parseBackticks('code at the `end`'),
		'code at the <code>end</code>',
	);
	t.is(
		parseBackticks('single backtick in a code span: `` ` ``'),
		'single backtick in a code span: <code>`</code>',
	);
	t.is(
		parseBackticks('backtick-delimited string in a code span: `` `foo` ``'),
		'backtick-delimited string in a code span: <code>`foo`</code>',
	);
	t.is(
		parseBackticks('single-character code span: `a`'),
		'single-character code span: <code>a</code>',
	);
	t.is(
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
	t.is(
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
	t.is(
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
	t.is(
		parseBackticks(`
			hello\`
			\`world
		`),
		`
			hello\`
			\`world
		`,
	);
	t.is(
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
