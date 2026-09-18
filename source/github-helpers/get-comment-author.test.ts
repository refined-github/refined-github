import {$} from 'select-dom';
import {expect, test} from 'vitest';

import getCommentAuthor from './get-comment-author.js';

function authorOf(html: string): string {
	document.body.innerHTML = html;
	return getCommentAuthor($('.rgh-test-anchor'));
}

test('comment whose avatar is wrapped in the author link', () => {
	expect(authorOf(`
		<div class="TimelineItem">
			<a href="/apps/coderabbitai" class="TimelineItem-avatar">
				<img alt="coderabbitai[bot]">
			</a>
			<div class="TimelineItem-body">
				<div class="comment-body rgh-test-anchor">Summary</div>
			</div>
		</div>
	`)).toBe('coderabbitai[bot]');
});

test('review comment whose avatar sits outside the author link', () => {
	// https://github.com/PostHog/posthog/pull/102919
	expect(authorOf(`
		<div class="TimelineItem">
			<div class="timeline-comment-group rgh-test-anchor">
				<div class="timeline-comment-header">
					<h3>
						<span><img class="avatar" alt="@stamphog"></span>
						<strong>
							<a class="author" href="/apps/stamphog">stamphog</a>
							<span class="Label">Bot</span>
						</strong>
					</h3>
				</div>
			</div>
		</div>
	`)).toBe('stamphog[bot]');
});

test('inline review comment whose header has no `timeline-comment-header`', () => {
	expect(authorOf(`
		<div class="review-comment rgh-test-anchor">
			<div class="d-flex">
				<h3>
					<span><img class="avatar" alt="@coderabbitai"></span>
					<strong>
						<a class="author" href="/apps/coderabbitai">coderabbitai</a>
					</strong>
				</h3>
			</div>
		</div>
	`)).toBe('coderabbitai[bot]');
});

test('human author is not marked as a bot', () => {
	expect(authorOf(`
		<div class="TimelineItem">
			<div class="timeline-comment-group rgh-test-anchor">
				<div class="timeline-comment-header">
					<h3>
						<span><img class="avatar" alt="@rnegron"></span>
						<strong><a class="author" href="/rnegron">rnegron</a></strong>
					</h3>
				</div>
			</div>
		</div>
	`)).toBe('rnegron');
});

test('human replying inside a bot review keeps their own name', () => {
	document.body.innerHTML = `
		<div class="TimelineItem">
			<a href="/apps/coderabbitai" class="TimelineItem-avatar"><img alt="coderabbitai[bot]"></a>
			<div class="TimelineItem-body">
				<div class="review-comment" id="human-reply">
					<h3>
						<span><img class="avatar" alt="@gantoine"></span>
						<strong><a class="author" href="/gantoine">gantoine</a></strong>
					</h3>
				</div>
			</div>
		</div>
	`;
	expect(getCommentAuthor($('#human-reply'))).toBe('gantoine');
});

test('Copilot reviews have no avatar image', () => {
	expect(authorOf(`
		<div class="TimelineItem">
			<a href="/apps/copilot-pull-request-reviewer" class="TimelineItem-avatar">
				<span class="avatar"><svg class="octicon octicon-copilot"></svg></span>
			</a>
			<div class="TimelineItem-body">
				<div class="comment-body rgh-test-anchor">Reviewed</div>
			</div>
		</div>
	`)).toBe('Copilot[bot]');
});
