import {
	$$,
	$optional,
	elementExists,
} from 'select-dom';

import {knownBots} from './selectors.js';

const knownBotSelector = knownBots.map(bot => `a[href*="/${bot}"]`);
const botLabelTexts = new Set(['AI', 'Bot']);

export default function isBotComment(item: Element): boolean {
	const commentHeader = $optional([
		'.timeline-comment-header',
		'[data-testid="comment-header"]',
	], item);

	if (!commentHeader) {
		return false;
	}

	if (elementExists(knownBotSelector, commentHeader)) {
		return true;
	}

	for (const label of $$([
		'.Label',
		'[class*="Label"]',
		'[class*="Pill"]',
		'[data-testid*="pill"]',
		'[data-testid*="badge"]',
	], commentHeader)) {
		if (botLabelTexts.has((label.textContent ?? '').trim())) {
			return true;
		}
	}

	return false;
}
