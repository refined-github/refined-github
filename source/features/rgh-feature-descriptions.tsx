import './rgh-feature-descriptions.css';

import * as pageDetect from 'github-url-detection';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

import FeatureDescriptions from '../rgh-feature-descriptions.svelte';

function add(infoBanner: HTMLElement): void {
	mount(FeatureDescriptions, {
		target: infoBanner.parentElement!,
		anchor: infoBanner,
	});
}

function init(signal: AbortSignal): void {
	observe('#repos-sticky-header', add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
		pageDetect.isRepoTree,
	],
	init,
});

/*

Test URLs:

- Regular feature: https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.tsx
- CSS counterpart: https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.css
- RGH feature: https://github.com/refined-github/refined-github/blob/main/source/features/rgh-feature-descriptions.css
- CSS-only feature: https://github.com/refined-github/refined-github/blob/main/source/features/reactions-popup.css
- Non-feature file (renders nothing): https://github.com/refined-github/refined-github/blob/main/readme.md
*/
