import {test, assert} from 'vitest';

import {
	preventPrCommitLinkLoss,
	preventPrCompareLinkLoss,
	preventDiscussionLinkLoss,
	prCommitUrlRegex,
	prCompareUrlRegex,
	discussionUrlRegex,
} from './prevent-link-loss.js';

function replacePrCommitLink(string: string): string {
	return string.replace(prCommitUrlRegex, preventPrCommitLinkLoss);
}

function replacePrCompareLink(string: string): string {
	return string.replace(prCompareUrlRegex, preventPrCompareLinkLoss);
}

function replaceDiscussionLink(string: string): string {
	return string.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

test('preventPrCommitLinkLoss', () => {
	assert.equal(replacePrCommitLink('https://www.google.com/'), 'https://www.google.com/');
	assert.equal(
		replacePrCommitLink('https://github.com/refined-github/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
		'https://github.com/refined-github/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb',
		'It should not affect non PR commit URLs',
	);
	assert.equal(
		replacePrCommitLink('https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
		'[`cb44a4e` (#3)](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
	);
	assert.equal(
		replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string'),
		'lorem ipsum dolor [`cb44a4e` (#3)](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
	);
	assert.equal(
		replacePrCommitLink(replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string')),
		'lorem ipsum dolor [`cb44a4e` (#44)](https://github.com/refined-github/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
		'It should not apply it twice',
	);
	assert.equal(
		replacePrCommitLink('I like [turtles](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)'),
		'I like [turtles](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
		'It should ignore Markdown links',
	);
	assert.equal(
		replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string'),
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
		'It should include line-permalink hashes',
	);
	assert.equal(
		replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3205/commits/b0ac07948f9d30a760bda25a7106011441abfd5d#r438059292 some random string'),
		'lorem ipsum dolor [`b0ac079` (#3205)](https://github.com/refined-github/refined-github/pull/3205/commits/b0ac07948f9d30a760bda25a7106011441abfd5d#r438059292) some random string',
		'It should include any hashes',
	);
	assert.equal(
		replacePrCommitLink(replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string')),
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
		'It should not apply it twice even with hashes',
	);
	assert.equal(
		replacePrCommitLink('https://github.com/refined-github/shorten-repo-url/pull/33/commits/3d8d1cc8d784c7d92788a8a21e2c30cf87be3658'),
		'[refined-github/shorten-repo-url@`3d8d1cc` (#33)](https://github.com/refined-github/shorten-repo-url/pull/33/commits/3d8d1cc8d784c7d92788a8a21e2c30cf87be3658)',
	);
});

test('preventPrCompareLinkLoss', () => {
	assert.equal(
		replacePrCompareLink('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0'),
		'https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0',
		'It should not affect compare URLs without a diff hash',
	);
	assert.equal(
		replacePrCompareLink('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191'),
		'[sindresorhus/got@`v11.5.2...v11.6.0`#diff-6be2971b2b](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)',
	);
	assert.equal(
		replacePrCompareLink('lorem ipsum dolor https://github.com/refined-github/refined-github/compare/main...incremental-tag-changelog-link#diff-5b3cf6bcc7c5b1373313553dc6f93a5eR7-R9 some random string'),
		'lorem ipsum dolor [`main...incremental-tag-changelog-link`#diff-5b3cf6bcc7](https://github.com/refined-github/refined-github/compare/main...incremental-tag-changelog-link#diff-5b3cf6bcc7c5b1373313553dc6f93a5eR7-R9) some random string',
	);
	assert.equal(
		replacePrCompareLink(replacePrCompareLink('lorem ipsum dolor https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191 some random string')),
		'lorem ipsum dolor [sindresorhus/got@`v11.5.2...v11.6.0`#diff-6be2971b2b](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191) some random string',
		'It should not apply it twice',
	);
	assert.equal(
		replacePrCompareLink('I like [turtles](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)'),
		'I like [turtles](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)',
		'It should ignore Markdown links',
	);
});

test('preventDiscussionLinkLoss', () => {
	assert.equal(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898'),
		'https://github.com/eslint/eslint/discussions/15898',
		'It should not affect discussion URLs without a query parameter', // It's what causes the bug
	);
	assert.equal(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898#discussion-4086661'),
		'https://github.com/eslint/eslint/discussions/15898#discussion-4086661',
		'It should not affect discussion comment URLs without a query parameter', // It's what causes the bug
	);
	assert.equal(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661'),
		'[eslint/eslint#15898 (comment)](https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661)',
	);
	assert.equal(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898?sort=top#issue-comment-box'),
		'[eslint/eslint#15898 (comment)](https://github.com/eslint/eslint/discussions/15898?sort=top#issue-comment-box)',
		'It should work on any hash',
	);
	assert.equal(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898?sort=top\nhttps://github.com/eslint/eslint/discussions/15898#discussioncomment-646707'),
		'[eslint/eslint#15898](https://github.com/eslint/eslint/discussions/15898?sort=top)\nhttps://github.com/eslint/eslint/discussions/15898#discussioncomment-646707',
		'It should work separately on links.',
	);
	assert.equal(
		replaceDiscussionLink('lorem ipsum dolor https://github.com/eslint/eslint/discussions/15898?sort=top some random string'),
		'lorem ipsum dolor [eslint/eslint#15898](https://github.com/eslint/eslint/discussions/15898?sort=top) some random string',
	);
	assert.equal(
		replaceDiscussionLink(replaceDiscussionLink('lorem ipsum dolor https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661 some random string')),
		'lorem ipsum dolor [eslint/eslint#15898 (comment)](https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661) some random string',
		'It should not apply it twice',
	);
	assert.equal(
		replaceDiscussionLink('I like [turtles](https://github.com/eslint/eslint/discussions/15898#discussion-4086661)'),
		'I like [turtles](https://github.com/eslint/eslint/discussions/15898#discussion-4086661)',
		'It should ignore Markdown links',
	);
	assert.equal(
		replaceDiscussionLink('https://github.com/streetcomplete/StreetComplete/discussions/15898?sort=top#discussioncomment-646707'),
		'[streetcomplete/StreetComplete#15898 (comment)](https://github.com/streetcomplete/StreetComplete/discussions/15898?sort=top#discussioncomment-646707)',
	);
});
