import {parseHTML} from 'linkedom';
import {$} from 'select-dom';
import {assert, describe, test} from 'vitest';

import isBotComment from './is-bot-comment.js';

function parseComment(markup: string): HTMLElement {
	const {document} = parseHTML(`<body>${markup}</body>`);
	return $([
		'.timeline-comment',
		'.react-issue-comment',
	], document);
}

describe('isBotComment', () => {
	test('detects known bots by author link', () => {
		const comment = parseComment(`
			<div class="timeline-comment">
				<div class="timeline-comment-header">
					<a href="/renovate-bot">renovate-bot</a>
				</div>
			</div>
		`);

		assert.isTrue(isBotComment(comment));
	});

	test.each(['Bot', 'AI'])('detects comments by %s badge', badge => {
		const comment = parseComment(`
			<div class="react-issue-comment">
				<div data-testid="comment-header">
					<a href="/octocat">octocat</a>
					<span class="Label">${badge}</span>
				</div>
			</div>
		`);

		assert.isTrue(isBotComment(comment));
	});

	test('does not match non-bot comments', () => {
		const comment = parseComment(`
			<div class="timeline-comment">
				<div class="timeline-comment-header">
					<a href="/octocat">octocat</a>
					<span class="Label">Member</span>
				</div>
			</div>
		`);

		assert.isFalse(isBotComment(comment));
	});
});
