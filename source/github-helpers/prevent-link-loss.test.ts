import {expect, test} from 'vitest';

import {
	preventPrCommitLinkLoss,
	preventPrCompareLinkLoss,
	preventDiscussionLinkLoss,
	prCommitUrlRegex,
	prCompareUrlRegex,
	discussionUrlRegex,
} from './prevent-link-loss';

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
	expect(replacePrCommitLink('https://www.google.com/')).toBe('https://www.google.com/');
	expect(
		replacePrCommitLink('https://github.com/refined-github/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
	).toBe(
		'https://github.com/refined-github/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb',
	);
	expect(
		replacePrCommitLink('https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
	).toBe(
		'[`cb44a4e` (#3)](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
	);
	expect(
		replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string'),
	).toBe(
		'lorem ipsum dolor [`cb44a4e` (#3)](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
	);
	expect(
		replacePrCommitLink(replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string')),
	).toBe(
		'lorem ipsum dolor [`cb44a4e` (#44)](https://github.com/refined-github/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
	);
	expect(
		replacePrCommitLink('I like [turtles](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)'),
	).toBe(
		'I like [turtles](https://github.com/refined-github/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
	);
	expect(
		replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string'),
	).toBe(
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
	);
	expect(
		replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3205/commits/b0ac07948f9d30a760bda25a7106011441abfd5d#r438059292 some random string'),
	).toBe(
		'lorem ipsum dolor [`b0ac079` (#3205)](https://github.com/refined-github/refined-github/pull/3205/commits/b0ac07948f9d30a760bda25a7106011441abfd5d#r438059292) some random string',
	);
	expect(
		replacePrCommitLink(replacePrCommitLink('lorem ipsum dolor https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string')),
	).toBe(
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/refined-github/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
	);
	expect(
		replacePrCommitLink('https://github.com/refined-github/shorten-repo-url/pull/33/commits/3d8d1cc8d784c7d92788a8a21e2c30cf87be3658'),
	).toBe(
		'[refined-github/shorten-repo-url@`3d8d1cc` (#33)](https://github.com/refined-github/shorten-repo-url/pull/33/commits/3d8d1cc8d784c7d92788a8a21e2c30cf87be3658)',
	);
});

test('preventPrCompareLinkLoss', () => {
	expect(
		replacePrCompareLink('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0'),
	).toBe('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0');
	expect(
		replacePrCompareLink('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191'),
	).toBe(
		'[sindresorhus/got@`v11.5.2...v11.6.0`#diff-6be2971b2b](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)',
	);
	expect(
		replacePrCompareLink('lorem ipsum dolor https://github.com/refined-github/refined-github/compare/main...incremental-tag-changelog-link#diff-5b3cf6bcc7c5b1373313553dc6f93a5eR7-R9 some random string'),
	).toBe(
		'lorem ipsum dolor [`main...incremental-tag-changelog-link`#diff-5b3cf6bcc7](https://github.com/refined-github/refined-github/compare/main...incremental-tag-changelog-link#diff-5b3cf6bcc7c5b1373313553dc6f93a5eR7-R9) some random string',
	);
	expect(
		replacePrCompareLink(replacePrCompareLink('lorem ipsum dolor https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191 some random string')),
	).toBe(
		'lorem ipsum dolor [sindresorhus/got@`v11.5.2...v11.6.0`#diff-6be2971b2b](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191) some random string',
	);
	expect(
		replacePrCompareLink('I like [turtles](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)'),
	).toBe(
		'I like [turtles](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)',
	);
});

test('preventDiscussionLinkLoss', () => {
	expect(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898'),
	).toBe('https://github.com/eslint/eslint/discussions/15898');
	expect(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898#discussion-4086661'),
	).toBe('https://github.com/eslint/eslint/discussions/15898#discussion-4086661');
	expect(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661'),
	).toBe(
		'[eslint/eslint#15898 (comment)](https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661)',
	);
	expect(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898?sort=top#issue-comment-box'),
	).toBe(
		'[eslint/eslint#15898 (comment)](https://github.com/eslint/eslint/discussions/15898?sort=top#issue-comment-box)',
	);
	expect(
		replaceDiscussionLink('https://github.com/eslint/eslint/discussions/15898?sort=top\nhttps://github.com/eslint/eslint/discussions/15898#discussioncomment-646707'),
	).toBe(
		'[eslint/eslint#15898](https://github.com/eslint/eslint/discussions/15898?sort=top)\nhttps://github.com/eslint/eslint/discussions/15898#discussioncomment-646707',
	);
	expect(
		replaceDiscussionLink('lorem ipsum dolor https://github.com/eslint/eslint/discussions/15898?sort=top some random string'),
	).toBe(
		'lorem ipsum dolor [eslint/eslint#15898](https://github.com/eslint/eslint/discussions/15898?sort=top) some random string',
	);
	expect(
		replaceDiscussionLink(replaceDiscussionLink('lorem ipsum dolor https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661 some random string')),
	).toBe(
		'lorem ipsum dolor [eslint/eslint#15898 (comment)](https://github.com/eslint/eslint/discussions/15898?sort=top#discussion-4086661) some random string',
	);
	expect(
		replaceDiscussionLink('I like [turtles](https://github.com/eslint/eslint/discussions/15898#discussion-4086661)'),
	).toBe(
		'I like [turtles](https://github.com/eslint/eslint/discussions/15898#discussion-4086661)',
	);
	expect(
		replaceDiscussionLink('https://github.com/streetcomplete/StreetComplete/discussions/15898?sort=top#discussioncomment-646707'),
	).toBe(
		'[streetcomplete/StreetComplete#15898 (comment)](https://github.com/streetcomplete/StreetComplete/discussions/15898?sort=top#discussioncomment-646707)',
	);
});
