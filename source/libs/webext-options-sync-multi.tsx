import {isBackgroundPage} from 'webext-detect-page';
import {getAdditionalPermissions} from 'webext-additional-permissions';
import OptionsSync, {Options, Setup} from 'webext-options-sync';

const isWeb = location.protocol.startsWith('http');

function parseHost(origin: string): string {
	return origin.includes('//') ? new URL(origin).host : origin;
}

function getKey(storageName: string, origin: string): string {
	const host = parseHost(origin);
	if (/(^|\.)github\.com$/.test(host)) {
		return storageName;
	}

	return `${storageName}-${host}`;
}

export default class OptionsSyncMulti<TOptions extends Options> extends OptionsSync<TOptions> {
	private readonly _options: Setup<TOptions>;

	// Instance is initialized automatically for the current domain, unless it's called in an extension page
	constructor(options: Setup<TOptions>) {
		// Pick the default origin when running this in an extension page
		const host = isWeb ? location.origin : 'https://github.com';
		options.storageName = options.storageName ?? 'options';
		super({
			...options,
			storageName: getKey(options.storageName!, host)
		});
		this._options = options;

		if (isBackgroundPage()) {
			this._initializeAdditionalOptions();
		}
	}

	async getAllOrigins(): Promise<Map<string, OptionsSync>> {
		if (isWeb) {
			throw Error('This function only work on extension pages');
		}

		const optionsByDomain = new Map<string, OptionsSync>();

		optionsByDomain.set('default', this);

		const {origins} = await getAdditionalPermissions();
		for (const origin of origins) {
			const host = parseHost(origin);
			optionsByDomain.set(host, this._getOriginInstance(origin));
		}

		return optionsByDomain;
	}

	private _getOriginInstance(origin: string): OptionsSync {
		return new OptionsSync({
			...this._options,
			storageName: getKey(this._options!.storageName!, origin) // Important: this should always use the inputted `storageName`, not `this.storageName`, which could already point to a different origin
		});
	}

	private async _initializeAdditionalOptions(): Promise<void> {
		// Run migrations for every domain
		const {origins} = await getAdditionalPermissions();
		for (const origin of origins) {
			this._getOriginInstance(origin);
		}

		// Add new domains
		browser.permissions.onAdded!.addListener(({origins}) => {
			if (origins) {
				for (const origin of origins) {
					this._getOriginInstance(origin);
				}
			}
		});

		// Remove old domains
		browser.permissions.onRemoved!.addListener(({origins}) => {
			if (origins) {
				const storageKeysToRemove = origins.map(origin => getKey(this.storageName, origin));
				browser.storage.sync.remove(storageKeysToRemove);
			}
		});
	}
}
