import {isBackgroundPage} from 'webext-detect-page';
import {getAdditionalPermissions} from 'webext-additional-permissions';
import OptionsSync, {Options, Setup} from 'webext-options-sync';

const isWeb = location.protocol.startsWith('http');

function parseHost(origin: string): string {
	return origin.includes('//') ? new URL(origin).host : origin;
}

function forbidExecutionOnWebPages(): void {
	if (isWeb) {
		throw new Error('This function only works on extension pages');
	}
}

function getKey(storageName: string, origin: string): string {
	const host = parseHost(origin);
	if (/(^|\.)github\.com$/.test(host)) {
		return storageName;
	}

	return `${storageName}-${host}`;
}

// TypeScript-only exports
// eslint-disable-next-line import/export
export * from 'webext-options-sync';

export default class OptionsSyncMulti<TOptions extends Options> extends OptionsSync<TOptions> {
	private readonly _baseOptions: Setup<TOptions>;

	// Instance is initialized automatically for the current domain, unless it's called in an extension page
	constructor(options: Setup<TOptions>) {
		// Pick the default origin when running this in an extension page
		const host = isWeb ? location.origin : 'https://github.com';
		options.storageName = options.storageName ?? 'options';
		super({
			...options,
			storageName: getKey(options.storageName, host)
		});
		this._baseOptions = options;

		if (isBackgroundPage()) {
			this._initializeAdditionalOrigins();
		}
	}

	async getAllOrigins(): Promise<Map<string, OptionsSync<TOptions>>> {
		forbidExecutionOnWebPages();

		const optionsByDomain = new Map<string, OptionsSync<TOptions>>();

		optionsByDomain.set('default', this);

		const {origins} = await getAdditionalPermissions();
		for (const origin of origins) {
			const host = parseHost(origin);
			optionsByDomain.set(host, this._getOriginInstance(origin));
		}

		return optionsByDomain;
	}

	async syncForm(form: string | HTMLFormElement): Promise<void> {
		forbidExecutionOnWebPages();

		super.syncForm(form);

		const optionsByOrigin = await this.getAllOrigins();
		if (optionsByOrigin.size === 1) {
			return;
		}

		// Create domain picker
		const dropdown = document.createElement('select');
		dropdown.addEventListener('change', this._domainPickerHandler.bind(this));
		for (const domain of optionsByOrigin.keys()) {
			const option = document.createElement('option');
			option.value = domain;
			option.textContent = domain;
			dropdown.append(option);
		}

		// Wrap and prepend to form
		const wrapper = document.createElement('p');
		wrapper.append('Domain selector: ', dropdown);
		this._form.prepend(wrapper, document.createElement('hr'));
	}

	private async _domainPickerHandler(event: Event): Promise<void> {
		const dropdown = event.currentTarget as HTMLSelectElement;

		for (const [domain, options] of await this.getAllOrigins()) {
			if (dropdown.value === domain) {
				options.syncForm(dropdown.form!);
			} else {
				options.stopSyncForm();
			}
		}
	}

	private _getOriginInstance(origin: string): OptionsSync<TOptions> {
		return new OptionsSync({
			...this._baseOptions,
			storageName: getKey(this._baseOptions.storageName!, origin) // Important: this should always use the inputted `storageName`, not `this.storageName`, which could already point to a different origin
		});
	}

	private async _initializeAdditionalOrigins(): Promise<void> {
		forbidExecutionOnWebPages();

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
