import * as pageDetect from 'github-url-detection';
import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import { getConversationNumber } from '../github-helpers/index.js';
import getTextNodes from '../helpers/get-text-nodes.js';

function underlinePrSelfReference(prConversation: HTMLElement): void {
	const prNumber = getConversationNumber();

	const textNodesOnThisLine = getTextNodes(prConversation);
	for (const [, textNode] of textNodesOnThisLine.entries()){
		let text = textNode.textContent;
		let prLink = textNode.parentElement;
		let prSelfReference = '#' + prNumber!.toString();

		if (prLink != null && text.includes(prSelfReference)) {
			prLink.style.textDecoration = 'underline wavy red';
		}
	}
}

function init(signal: AbortSignal): void {
	observe([
		'.comment-body',
		'.markdown-body',
		'.js-comment-body',
		'.soft-wrap',
		'.user-select-contain',
		'.d-block',
	], underlinePrSelfReference, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	init,
});

/*

## Test URLs

https://github.com/prettier/prettier/pull/9275

*/
