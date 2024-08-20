import './dim-bots.css';
import {$$} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';
import preserveScroll from '../helpers/preserve-scroll.js';
import observe from '../helpers/selector-observer.js';
import {botLinksCommitSelectors, botLinksPrSelectors} from '../github-helpers/selectors.js';

const dimBots = features.getIdentifiers(import.meta.url);

const interactiveElementsSelector = 'a, button, input, [tabindex]';

function undimBots(event: DelegateEvent): void {
	const target = event.target as HTMLElement;
	// Only undim when clicking on empty areas
	if (target.closest(interactiveElementsSelector)) {
		return;
	}

	const resetScroll = preserveScroll(target);
	for (const bot of $$(dimBots.selector)) {
		bot.classList.add('rgh-interacted');
	}

	resetScroll();
}

function dim(commit: HTMLElement): void {
	commit.closest([
		'[data-testid="commit-row-item"]',

		'.Box-row', // PRs
	])!.classList.add(dimBots.class);
}

async function init(signal: AbortSignal): Promise<void> {
	observe([...botLinksCommitSelectors, ...botLinksPrSelectors], dim, {signal});

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
- Commits by unmarked bot: https://github.com/rust-lang/rust/commits/master?after=c387f012b14a3d64e0d580b7ebe65e5325bcf822+34&branch=master&qualified_name=refs%2Fheads%2Fmaster
- PRs: https://github.com/OctoLinker/OctoLinker/pulls?q=is%3Apr+is%3Aclosed
- PRs by unmarked bot: https://github.com/spotify/scio/pulls?q=is%3Apr+sort%3Aupdated-desc+is%3Aclosed+steward
- PR Commits: https://github.com/pixiebrix/webext-messenger/pull/173/commits

*/
