import test from 'ava';
import './fixtures/globals';
import {stripIndent} from 'common-tags';
import {getSmarterMarkdown} from '../source/features/copy-markdown';

test('base markdown', t => {
	t.is(
		getSmarterMarkdown('<a href="url">this</a> is <strong>markdown</strong>'),
		'[this](url) is **markdown**'
	);
});

test('drop <g-emoji>', t => {
	t.is(
		getSmarterMarkdown('<g-emoji alias="fire" fallback-src="https://assets-cdn.github.com/images/icons/emoji/unicode/1f525.png" ios-version="6.0" title=":fire:">🔥</g-emoji>'),
		'🔥'
	);
});

test('drop tasks from lists', t => {
	t.is(
		getSmarterMarkdown(stripIndent`
			<ul class="contains-task-list">
			<li class="task-list-item enabled"><span class="handle"><svg class="drag-handle" aria-hidden="true" width="16" height="15" version="1.1" viewBox="0 0 16 15"><path d="M12,4V5H4V4h8ZM4,8h8V7H4V8Zm0,3h8V10H4v1Z"></path></svg></span><input type="checkbox" class="task-list-item-checkbox"> try me out</li>
			<li class="task-list-item enabled"><span class="handle"><svg class="drag-handle" aria-hidden="true" width="16" height="15" version="1.1" viewBox="0 0 16 15"><path d="M12,4V5H4V4h8ZM4,8h8V7H4V8Zm0,3h8V10H4v1Z"></path></svg></span><input type="checkbox" class="task-list-item-checkbox" checked=""> test across lines</li>
			</ul>
			`),
		stripIndent`
		*    try me out
		*    test across lines
		`
	);
});

test('drop autolinks around images', t => {
	t.is(
		getSmarterMarkdown(stripIndent`
			<a href="https://camo.githubusercontent.com/7a0ef30dc39981585543e0bbd816392a52dddd8a/687474703a2f2f692e696d6775722e636f6d2f4b6361644c36472e706e67" target="_blank"><img src="https://camo.githubusercontent.com/7a0ef30dc39981585543e0bbd816392a52dddd8a/687474703a2f2f692e696d6775722e636f6d2f4b6361644c36472e706e67" alt="" style="max-width:100%;"></a>
			`),
		stripIndent`
			![](https://camo.githubusercontent.com/7a0ef30dc39981585543e0bbd816392a52dddd8a/687474703a2f2f692e696d6775722e636f6d2f4b6361644c36472e706e67)
		`
	);
});

test('keep img tags if they have width, height or align', t => {
	t.is(
		getSmarterMarkdown(stripIndent`
			<a href="https://camo.githubusercontent.com/7a0ef30dc39981585543e0bbd816392a52dddd8a/687474703a2f2f692e696d6775722e636f6d2f4b6361644c36472e706e67" target="_blank"><img align="center" width="32" alt="copy" src="https://camo.githubusercontent.com/7a0ef30dc39981585543e0bbd816392a52dddd8a/687474703a2f2f692e696d6775722e636f6d2f4b6361644c36472e706e67" style="max-width:100%;"></a>
		`),
		stripIndent`
			<img align="center" width="32" alt="copy" src="https://camo.githubusercontent.com/7a0ef30dc39981585543e0bbd816392a52dddd8a/687474703a2f2f692e696d6775722e636f6d2f4b6361644c36472e706e67" style="max-width:100%;">
		`
	);
});

test('drop autolinks from issue links and commit links', t => {
	t.is(
		getSmarterMarkdown(stripIndent`
			<a href="https://github.com/sindresorhus/refined-github/issues/522" class="issue-link js-issue-link" data-id="237988387" data-error-text="Failed to load issue title" data-permission-text="Issue title is private" title="'Copy to Markdown' improvements">#522</a>
		`),
		'https://github.com/sindresorhus/refined-github/issues/522'
	);
	t.is(
		getSmarterMarkdown(stripIndent`
			<a href="https://github.com/sindresorhus/refined-github/commit/833d5984fffb18a44b83d965b397f82e0ff3085e" class="commit-link"><tt>833d598</tt></a>
		`),
		'https://github.com/sindresorhus/refined-github/commit/833d5984fffb18a44b83d965b397f82e0ff3085e'
	);
});

test('drop autolinks around some shortened links', t => {
	t.is(
		getSmarterMarkdown(stripIndent`
			<p><a href="https://www.npmjs.com">npmjs.com</a></p>
			<p><a href="https://twitter.com/bfred_it">twitter.com/bfred_it</a></p>
			<p><a href="https://github.com/">github.com</a></p>
		`),
		stripIndent`
			https://www.npmjs.com/

			https://twitter.com/bfred_it

			https://github.com/
		`
	);
});

test('wrap orphaned li in their original parent', t => {
	t.is(
		getSmarterMarkdown(stripIndent`
			<ol start="99">
				<li>big lists</li>
				<li>deserve big numbers</li>
			</ol>
		`),
		stripIndent`
			99.  big lists
			100.  deserve big numbers
		`
	);
});
