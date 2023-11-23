import './dim-bots.css';
import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import preserveScroll from '../helpers/preserve-scroll.js';
import observe from '../helpers/selector-observer.js';

const botNames = [
	'actions-user',
	'bors',
	'ImgBotApp',
	'Octomerger',
	'renovate-bot',
	'rust-highfive',
	'scala-steward',
	'snyk-bot',
	'web-flow',
	'weblate',
] as const;

// All co-authored commits are excluded because it's unlikely that any bot co-authors with another bot, but instead they're co-authored with a human. In that case we don't want to dim the commit.
const commitSelectors = [
	// Co-authored commits are excluded because their avatars are not linked
	...botNames.map(bot => `div[data-testid="author-avatar"] a[href$="?author=${bot}"]`),
	'div[data-testid="author-avatar"] a[href$="%5Bbot%5D"]', // Generic `[bot]` label in avatar in New view

	// Legacy view, still used by PR commits
	// :only-child excludes co-authored commits
	...botNames.map(bot => `.commit-author[href$="?author=${bot}"]:only-child`),
	'.commit-author[href$="%5Bbot%5D"]:only-child', // Generic `[bot]` label in author name
];

const prSelectors = [
	...botNames.flatMap(bot => [
		`.opened-by [title$="pull requests created by ${bot}"]`,
		`.opened-by [title$="pull requests opened by ${bot}"]`,
	]),
	'.opened-by [href*="author%3Aapp%2F"]', // Search query `is:pr+author:app/*`
	'.labels [href$="label%3Abot"]', // PR tagged with `bot` label
];

const dimBots = features.getIdentifiers(import.meta.url);

function undimBots(event: DelegateEvent): void {
	const target = event.target as HTMLElement;
	// Only undim when clicking on empty areas
	if (target.closest('a, button, input, [tabindex]')) {
		return;
	}

	const resetScroll = preserveScroll(target);
	for (const bot of $$(dimBots.selector)) {
		bot.classList.add('rgh-interacted');
	}

	resetScroll();
}

function dimCommit(commit: HTMLElement): void {
	commit.classList.add(dimBots.class);
}

function dimPr(pr: HTMLElement): void {
	// TODO: Use :has selector and merge into a single `selectors` array
	pr.closest('.commit, .Box-row')!.classList.add(dimBots.class);
}

async function init(signal: AbortSignal): Promise<void> {
	observe(commitSelectors, dimCommit, {signal});
	observe(prSelectors, dimPr, {signal});

	// Undim on mouse focus
	delegate(dimBots.selector, 'click', undimBots, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isCommitList,
		pageDetect.isIssueOrPRList,
	],
	init,
});

/*

Test URLs

- Commits: https://github.com/typed-ember/ember-cli-typescript/commits/master?after=5ff0c078a4274aeccaf83382c0d6b46323f57397+174
- PRs: https://github.com/OctoLinker/OctoLinker/pulls?q=is%3Apr+is%3Aclosed

*/
