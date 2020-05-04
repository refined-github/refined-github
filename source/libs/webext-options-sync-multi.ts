import {isBackgroundPage} from 'webext-detect-page';
import {getAdditionalPermissions, getManifestPermissionsSync} from 'webext-additional-permissions';
import OptionsSync, {Options, Setup} from 'webext-options-sync';

const defaultOrigins = urlGlobsToRegex(getManifestPermissionsSync().origins);
const isWeb = location.protocol.startsWith('http');

// Copied from https://github.com/fregante/content-scripts-register-polyfill/blob/2202738946b6da5eddcab672340e97f09313b13b/index.ts#L1
function urlGlobToRawRegex(matchPattern: string): string {
	/* eslint-disable unicorn/better-regex */
	return '^' + matchPattern
		.replace(/[.]/g, '\\.') // Escape dots
		.replace(/[?]/, '.') // Single-character wildcards
		.replace(/^[*]:/, 'https?') // Protocol
		.replace(/^(https[?]?:[/][/])[*]/, '$1[^/:]+') // Subdomain wildcard
		.replace(/[/][*]/, '/?.+') // Whole path wildcards (so it can match the whole origin)
		.replace(/[*]/g, '.+') // Path wildcards
		.replace(/[/]/g, '\\/'); // Escape slashes
	/* eslint-enable unicorn/better-regex */
}

function urlGlobsToRegex(matchPatterns: string[]): RegExp {
	return new RegExp(matchPatterns.map(urlGlobToRawRegex).join('$') + '$');
}

function parseHost(origin: string): string {
	return origin.includes('//') ? new URL(origin).host : origin;
}

function forbidExecutionOnWebPages(): void {
	if (isWeb) {
		throw new Error('This function only works on extension pages');
	}
}

/** Ensures that only the base storage name (i.e. without domain) is used in functions that require it */
type BaseStorageName = string;

function getStorageNameForOrigin(storageName: BaseStorageName, origin: string): string {
	return storageName + '-' + parseHost(origin);
}

// TypeScript-only exports
// eslint-disable-next-line import/export
export * from 'webext-options-sync';

export default class OptionsSyncMulti<TOptions extends Options> extends OptionsSync<TOptions> {
	private readonly _baseOptions: Readonly<Setup<TOptions> & {storageName: BaseStorageName}>;

	// Instance is initialized automatically for the current domain, unless it's called in an extension page
	constructor(options: Setup<TOptions>) {
		// Apply defaults
		const baseOptions = {
			...options,
			storageName: options.storageName ?? 'options'
		} as const;

		// Extension pages should always use the default options as base
		if (!isWeb || defaultOrigins.test(location.origin)) {
			super(baseOptions);
		} else {
			super({
				...baseOptions,
				storageName: getStorageNameForOrigin(baseOptions.storageName, origin)
			});
		}

		this._baseOptions = baseOptions;

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
			storageName: getStorageNameForOrigin(this._baseOptions.storageName, origin)
		});
	}

	private async _initializeAdditionalOrigins(): Promise<void> {
		if (!isBackgroundPage()) {
			throw new Error('Initialization should only be called on background pages.');
		}

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
				const storageKeysToRemove = origins
					.map(origin => getStorageNameForOrigin(this._baseOptions.storageName, origin))
					.filter(key => key !== this.storageName);
				browser.storage.sync.remove(storageKeysToRemove);
			}
		});
	}
}
