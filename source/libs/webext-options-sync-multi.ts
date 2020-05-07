import 'webext-permissions-events-polyfill';
import mem from 'mem';
import {patternToRegex} from 'webext-patterns';
import {isBackgroundPage} from 'webext-detect-page';
import OptionsSync, {Options, Setup} from 'webext-options-sync';
import {getAdditionalPermissions, getManifestPermissionsSync} from 'webext-additional-permissions';

const defaultOrigins = patternToRegex(...getManifestPermissionsSync().origins);
const isWeb = location.protocol.startsWith('http');

function memoizeMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
	descriptor.value = mem(target[propertyKey]);
}

function forbidMethodOnWeb(target: any, propertyKey: string, descriptor: PropertyDescriptor): void {
	const method = target[propertyKey];
	descriptor.value = function (...arguments_: unknown[]) {
		if (isWeb) {
			throw new Error('This function only works on extension pages');
		}

		return method.apply(this, arguments_);
	};
}

function parseHost(origin: string): string {
	return origin.includes('//') ? new URL(origin).host : origin;
}

/** Ensures that only the base storage name (i.e. without domain) is used in functions that require it */
type BaseStorageName = string;

function getStorageNameForOrigin(storageName: BaseStorageName, origin: string): string {
	return storageName + '-' + parseHost(origin);
}

// TypeScript-only exports
// eslint-disable-next-line import/export
export * from 'webext-options-sync';

export {OptionsSync};

export default class OptionsSyncMulti<TOptions extends Options> {
	static readonly migrations = OptionsSync.migrations;

	readonly #defaultOptions: Readonly<Setup<TOptions> & {storageName: BaseStorageName}>;

	constructor(options: Setup<TOptions>) {
		// Apply defaults
		this.#defaultOptions = {
			...options,
			storageName: options.storageName ?? 'options'
		};

		if (!isBackgroundPage()) {
			return;
		}

		// Run migrations for every origin
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		if (options.migrations?.length! > 0) {
			this.getAllOrigins();
		}

		// Delete stored options when permissions are removed
		browser.permissions.onRemoved!.addListener(({origins}) => {
			const storageKeysToRemove = (origins ?? [])
				.filter(key => !defaultOrigins.test(key))
				.map(origin => getStorageNameForOrigin(this.#defaultOptions.storageName, origin));

			browser.storage.sync.remove(storageKeysToRemove);
		});
	}

	@memoizeMethod
	getOptionsForOrigin(origin = location.origin): OptionsSync<TOptions> {
		// Extension pages should always use the default options as base
		if (!origin.startsWith('http') || defaultOrigins.test(origin)) {
			return new OptionsSync(this.#defaultOptions);
		}

		return new OptionsSync({
			...this.#defaultOptions,
			storageName: getStorageNameForOrigin(this.#defaultOptions.storageName, origin)
		});
	}

	@memoizeMethod
	@forbidMethodOnWeb
	async getAllOrigins(): Promise<Map<string, OptionsSync<TOptions>>> {
		const optionsByDomain = new Map<string, OptionsSync<TOptions>>();

		optionsByDomain.set('default', this.getOptionsForOrigin());

		const {origins} = await getAdditionalPermissions();
		for (const origin of origins) {
			const host = parseHost(origin);
			optionsByDomain.set(host, this.getOptionsForOrigin(origin));
		}

		return optionsByDomain;
	}

	@forbidMethodOnWeb
	async syncForm(form: string | HTMLFormElement): Promise<void> {
		if (typeof form === 'string') {
			form = document.querySelector<HTMLFormElement>(form)!;
		}

		const optionsByOrigin = await this.getAllOrigins();
		await optionsByOrigin.get('default')!.syncForm(form);

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
		form.prepend(wrapper, document.createElement('hr'));
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
}
