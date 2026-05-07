import './rgh-feature-descriptions.css';

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

const featureUrlRegex = /^(?:[/]refined-github){2}[/]blob[/][^/]+[/]source[/]features[/][^.]+[.](?:tsx|css)$/;

void features.add(import.meta.url, {
	include: [
		() => featureUrlRegex.test(location.pathname),
	],
	init,
});

/*

Test URLs:

- Regular feature: https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.tsx
- CSS counterpart: https://github.com/refined-github/refined-github/blob/main/source/features/sync-pr-commit-title.css
- RGH feature: https://github.com/refined-github/refined-github/blob/main/source/features/rgh-feature-descriptions.css
- CSS-only feature: https://github.com/refined-github/refined-github/blob/main/source/features/reactions-popup.css
*/
