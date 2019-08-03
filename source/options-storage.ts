import OptionsSync from 'webext-options-sync';
import {isBackgroundPage} from 'webext-detect-page';
import {getAdditionalPermissions} from 'webext-additional-permissions';

export interface RGHOptions {
	customCSS: string;
	personalToken: string;
	logging: boolean;
	minimizedUsers: string;
	[featureName: string]: string | boolean;
}

function featureWasRenamed(from: string, to: string): any { // TODO: any should probably be `Migration` after `webext-options-sync`'s types are fixed
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
	featureWasRenamed('make-discussion-sidebar-sticky', 'sticky-discussion-sidebar'), // Merged on August 1st

	// Removed features will be automatically removed from the options as well
	OptionsSync.migrations.removeUnused
];

function getStorageName(host: string): string {
	// The first two will match the hosts of Chrome’s and Firefox’s extension pages
	if (/^([^.]{32}|[^.]{36}|github.com|gist.github.com)$/.test(location.host)) {
		return 'options';
	}

	return `options-${host}`;
}

function getOptions(host: string): OptionsSync<RGHOptions> {
	return new OptionsSync({storageName: getStorageName(host), migrations, defaults});
}

// Default to `options` on github.com and in the background script
// Automatically picks the right domain to support GitHub Enteprise
export default getOptions(location.host);

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
