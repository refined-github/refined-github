import {OptionsSync} from 'webext-options-sync-per-domain';

import {RGHOptions, perDomainOptions} from './options-storage';

export default async function bisectFeatures(): Promise<void> {
	const options = perDomainOptions.getOptionsForOrigin();
	const featuresState = Object.fromEntries(Object.entries(await options.getAll()).filter(([key]) => key.startsWith('feature:')));
	const savedFeaturesState = {...featuresState};

	// Test with all features disabled first
	await onlyEnableFeatures(options, featuresState, []);
	if (await confirmBug()) {
		window.alert('It’s a native GitHub bug!');
	} else {
		let testedFeatures = Object.keys(featuresState);
		while (testedFeatures.length > 1) {
			const half = Math.ceil(testedFeatures.length / 2);
			const firstHalf = testedFeatures.slice(0, half);
			const stepsRemaining = Math.ceil(Math.log2(firstHalf.length));
			/* eslint-disable no-await-in-loop */
			await onlyEnableFeatures(options, featuresState, firstHalf);
			testedFeatures = await confirmBug(`${stepsRemaining} step(s) remaining`) ? firstHalf : testedFeatures.slice(half);
			/* eslint-enable no-await-in-loop */
		}

		window.alert('`' + testedFeatures[0].replace('feature:', '') + '` is causing the bug.');
	}

	await options.set(savedFeaturesState);
	await reloadGitHubTabs();
	await browser.tabs.reload();
}

async function confirmBug(details?: string): Promise<boolean> {
	await reloadGitHubTabs();
	return window.confirm('Can you see the bug?' + (details ? ` (${details})` : ''));
}

async function reloadGitHubTabs(): Promise<void> {
	const githubTabs = await browser.tabs.query({currentWindow: true, url: 'https://github.com/*'});
	await Promise.all(githubTabs.map(async tab => {
		if (tab.id) {
			await browser.tabs.reload(tab.id);
		}
	}));
}

async function onlyEnableFeatures(options: OptionsSync<RGHOptions>, featuresState: Record<string, boolean>, enabledFeatures: string[]): Promise<void> {
	for (const feature of Object.keys(featuresState)) {
		featuresState[feature] = enabledFeatures.includes(feature);
	}

	await options.set(featuresState);
}
