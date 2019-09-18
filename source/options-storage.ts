import OptionsSync, {Migration} from 'webext-options-sync';
import {isBackgroundPage} from 'webext-detect-page';
import {getAdditionalPermissions} from 'webext-additional-permissions';

export interface RGHOptions {
	customCSS: string;
	personalToken: string;
	logging: boolean;
	minimizedUsers: string;
	[featureName: string]: string | boolean;
}

function featureWasRenamed(from: string, to: string): Migration<RGHOptions> {
	return (options: RGHOptions) => {
		if (typeof options[`feature:${from}`] === 'boolean') {
			options[`feature:${to}`] = options[`feature:${from}`];
		}
	};
}

const defaults: RGHOptions = {
	customCSS: '',
	personalToken: '',
	logging: false,
	minimizedUsers: ''
};

// This variable is replaced at build time with the list
for (const feature of __featuresList__) {
	defaults[`feature:${feature}`] = true;
}

const migrations = [
	featureWasRenamed('linkify-code', 'linkify-urls-in-code'), // Merged on September 1st
	featureWasRenamed('highlight-collaborators-in-lists', 'highlight-collaborators-and-own-discussions'), // Merged on September 20th

	// Removed features will be automatically removed from the options as well
	OptionsSync.migrations.removeUnused
];

// Keep this function "dumb". Don't move more "smart" domain selection logic in here
function getStorageName(host: string): string {
	if (/(^|\.)github\.com$/.test(host)) {
		return 'options';
	}

	return `options-${host}`;
}

function getOptions(host: string): OptionsSync<RGHOptions> {
	return new OptionsSync({storageName: getStorageName(host), migrations, defaults});
}

// This should return the options for the current domain or, if called from an extension page, for `github.com`
export default getOptions(location.protocol.startsWith('http') ? location.host : 'github.com');

export async function getAllOptions(): Promise<Map<string, OptionsSync<RGHOptions>>> {
	const optionsByDomain = new Map<string, OptionsSync<RGHOptions>>();
	optionsByDomain.set('github.com', getOptions('github.com'));

	const {origins} = await getAdditionalPermissions();
	for (const origin of origins) {
		const {host} = new URL(origin);
		optionsByDomain.set(host, getOptions(host));
	}

	return optionsByDomain;
}

async function initializeAllOptions(): Promise<void> {
	// Run migrations for every domain
	const {origins} = await getAdditionalPermissions();
	for (const origin of origins) {
		getOptions(new URL(origin).host);
	}

	// Add new domains
	browser.permissions.onAdded!.addListener(({origins}) => {
		if (origins) {
			for (const origin of origins) {
				getOptions(new URL(origin).host);
			}
		}
	});

	// Remove old domains
	browser.permissions.onRemoved!.addListener(({origins}) => {
		if (origins) {
			const optionKeysToRemove = origins.map(origin => getStorageName(new URL(origin).host));
			browser.storage.sync.remove(optionKeysToRemove);
		}
	});
}

if (isBackgroundPage()) {
	initializeAllOptions();
}
