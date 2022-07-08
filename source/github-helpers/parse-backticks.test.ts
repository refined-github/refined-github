import {expect, test} from 'vitest';

import {getParsedBackticksParts} from './parse-backticks';

function parseBackticks(string: string): string {
	return getParsedBackticksParts(string).map(
		(part, index) => index % 2 && part.length > 0 ? `<code>${part.trim()}</code>` : part,
	).join('');
}

test('parseBackticks', () => {
	expect(parseBackticks('multiple `code spans` between ` other ` text')).toBe('multiple <code>code spans</code> between <code>other</code> text');
	expect(parseBackticks('`code` at the start')).toBe('<code>code</code> at the start');
	expect(parseBackticks('code at the `end`')).toBe('code at the <code>end</code>');
	expect(parseBackticks('single backtick in a code span: `` ` ``')).toBe('single backtick in a code span: <code>`</code>');
	expect(parseBackticks('backtick-delimited string in a code span: `` `foo` ``')).toBe('backtick-delimited string in a code span: <code>`foo`</code>');
	expect(parseBackticks('single-character code span: `a`')).toBe('single-character code span: <code>a</code>');
	expect(parseBackticks(`
        triple-backtick multiline block
        \`\`\`
        foo
        bar
        \`\`\`
        in some text #3990
    `)).toBe(`
        triple-backtick multiline block
        \`\`\`
        foo
        bar
        \`\`\`
        in some text #3990
    `);
	expect(parseBackticks(`
        empty triple-backtick block
        \`\`\`
        \`\`\`
    `)).toBe(`
        empty triple-backtick block
        \`\`\`
        \`\`\`
    `);
	expect(parseBackticks(`
        triple-backtick code block
        \`\`\`
        foo
        bar
        \`\`\`
        in some text #3990
    `)).toBe(`
        triple-backtick code block
        \`\`\`
        foo
        bar
        \`\`\`
        in some text #3990
    `);
	expect(parseBackticks(`
        hello\`
        \`world
    `)).toBe(`
        hello\`
        \`world
    `);
	expect(parseBackticks(`
        hello\`\` red
        \`\`world
    `)).toBe(`
        hello\`\` red
        \`\`world
    `);
});
