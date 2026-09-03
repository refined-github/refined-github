/* eslint-disable @typescript-eslint/no-use-before-define -- Keep the main flow before its helper */

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import expandLinkedDiff from '../helpers/expand-linked-diff.js';
import {waitForElement} from '../helpers/selector-observer.js';

function init(signal: AbortSignal): void {
	let runController: AbortController;
	function run(): void {
		if (runController) {
			runController.abort();
		}

		runController = new AbortController();
		void expandLinkedDiff(location.hash, {
			signal: AbortSignal.any([
				signal,
				runController.signal,
				AbortSignal.timeout(15_000),
			]),
			waitForElement: waitForHtmlElement,
		});
	}

	run();
	globalThis.addEventListener('hashchange', run, {signal});
}

async function waitForHtmlElement(
	selectors: string | readonly string[],
	{signal}: {signal: AbortSignal},
): Promise<HTMLElement | undefined> {
	return await waitForElement(selectors, {signal}) as HTMLElement | undefined;
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRFiles,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github/pull/9943/changes#diff-053150b640a7ce75eff69d1a22cae7f0f94ad64ce9a855db544dda0929316519R115-R150
https://github.com/refined-github/refined-github/pull/9943/files#diff-053150b640a7ce75eff69d1a22cae7f0f94ad64ce9a855db544dda0929316519R115-R150

*/
