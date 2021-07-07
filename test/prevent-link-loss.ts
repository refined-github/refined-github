import test from 'ava';

import './fixtures/globals';
import {
	preventPrCommitLinkLoss,
	preventPrCompareLinkLoss,
	preventDiscussionLinkLoss,
	prCommitUrlRegex,
	prCompareUrlRegex,
	discussionUrlRegex,
} from '../source/github-helpers/prevent-link-loss';

function replacePrCommitLink(string: string): string {
	return string.replace(prCommitUrlRegex, preventPrCommitLinkLoss);
}

function replacePrCompareLink(string: string): string {
	return string.replace(prCompareUrlRegex, preventPrCompareLinkLoss);
}

function replaceDiscussionLink(string: string): string {
	return string.replace(discussionUrlRegex, preventDiscussionLinkLoss);
}

test('preventPrCommitLinkLoss', t => {
	t.is(replacePrCommitLink('https://www.google.com/'), 'https://www.google.com/');
	t.is(
		replacePrCommitLink('https://github.com/sindresorhus/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
		'https://github.com/sindresorhus/refined-github/commit/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb',
		'It should not affect non PR commit URLs',
	);
	t.is(
		replacePrCommitLink('https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb'),
		'[`cb44a4e` (#3)](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
	);
	t.is(
		replacePrCommitLink('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string'),
		'lorem ipsum dolor [`cb44a4e` (#3)](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
	);
	t.is(
		replacePrCommitLink(replacePrCommitLink('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb some random string')),
		'lorem ipsum dolor [`cb44a4e` (#44)](https://github.com/sindresorhus/refined-github/pull/44/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb) some random string',
		'It should not apply it twice',
	);
	t.is(
		replacePrCommitLink('I like [turtles](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)'),
		'I like [turtles](https://github.com/sindresorhus/refined-github/pull/3/commits/cb44a4eb8cd5c66def3dc26dca0f386645fa29bb)',
		'It should ignore Markdown links',
	);
	t.is(
		replacePrCommitLink('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string'),
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
		'It should include any hashes',
	);
	t.is(
		replacePrCommitLink(replacePrCommitLink('lorem ipsum dolor https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60 some random string')),
		'lorem ipsum dolor [`1da152b` (#3205)](https://github.com/sindresorhus/refined-github/pull/3205/commits/1da152b3f8c51dd72d8ae6ad9cc96e0c2d8716f5#diff-932095cc3c0dff00495b4c392d78f0afR60) some random string',
		'It should not apply it twice even with hashes',
	);
});

test('preventPrCompareLinkLoss', t => {
	t.is(
		replacePrCompareLink('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0'),
		'https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0',
		'It should not affect compare URLs without a diff hash',
	);
	t.is(
		replacePrCompareLink('https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191'),
		'[`v11.5.2...v11.6.0`#diff-6be2971b2b](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)',
	);
	t.is(
		replacePrCompareLink('lorem ipsum dolor https://github.com/sindresorhus/refined-github/compare/main...incremental-tag-changelog-link#diff-5b3cf6bcc7c5b1373313553dc6f93a5eR7-R9 some random string'),
		'lorem ipsum dolor [`main...incremental-tag-changelog-link`#diff-5b3cf6bcc7](https://github.com/sindresorhus/refined-github/compare/main...incremental-tag-changelog-link#diff-5b3cf6bcc7c5b1373313553dc6f93a5eR7-R9) some random string',
	);
	t.is(
		replacePrCompareLink(replacePrCompareLink('lorem ipsum dolor https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191 some random string')),
		'lorem ipsum dolor [`v11.5.2...v11.6.0`#diff-6be2971b2b](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191) some random string',
		'It should not apply it twice',
	);
	t.is(
		replacePrCompareLink('I like [turtles](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)'),
		'I like [turtles](https://github.com/sindresorhus/got/compare/v11.5.2...v11.6.0#diff-6be2971b2bb8dbf48d15ff680dd898b0R191)',
		'It should ignore Markdown links',
	);
});

test('preventDiscussionLinkLoss', t => {
	t.is(
		replaceDiscussionLink('https://github.com/streetcomplete/StreetComplete/discussions/2789'),
		'https://github.com/streetcomplete/StreetComplete/discussions/2789',
		'It should not affect discussion URLs without a query parameter',
	);
	t.is(
		replaceDiscussionLink('https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top#discussioncomment-646707'),
		'[#2789 (comment)](https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top#discussioncomment-646707)',
	);
	t.is(
		replaceDiscussionLink('https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top\nhttps://github.com/streetcomplete/StreetComplete/discussions/2789#discussioncomment-646707'),
		'[#2789](https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top)\nhttps://github.com/streetcomplete/StreetComplete/discussions/2789#discussioncomment-646707',
		'It should work separately on links.',
	);
	t.is(
		replaceDiscussionLink('lorem ipsum dolor https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top some random string'),
		'lorem ipsum dolor [#2789](https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top) some random string',
	);
	t.is(
		replaceDiscussionLink(replaceDiscussionLink('lorem ipsum dolor https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top#discussioncomment-646707 some random string')),
		'lorem ipsum dolor [#2789 (comment)](https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top#discussioncomment-646707) some random string',
		'It should not apply it twice',
	);
	t.is(
		replaceDiscussionLink('I like [turtles](https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top#discussioncomment-646707)'),
		'I like [turtles](https://github.com/streetcomplete/StreetComplete/discussions/2789?sort=top#discussioncomment-646707)',
		'It should ignore Markdown links',
	);
});
