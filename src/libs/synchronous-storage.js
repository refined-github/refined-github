/**
 * Allows usage of async get/set API synchronously.
 * Requirements:
 * - SynchronousStorage must be the only way to get/set the storage
 * - The source API must be promised
 * - The first call must be awaited to make sure the value has been loaded
 *
 * Usage:

import SynchronousStorage from './synchronous-storage';

const storage = await new SynchronousStorage(
	() => browser.storage.local.get('name'),
	va => browser.storage.local.set({name: va})
);

console.log(storage.get()); // {}
storage.set('Federico');
console.log(storage.get()); // {name: 'Federico'}

 *
 * Caveats:
 * - .set() returns a promise that you can use to catch write errors.
 *   However if an error happens, SynchronousStorage will no longer match the real cache.
 */
export default class SynchronousStorage {
	constructor(get, set) {
		this._get = get;
		this._set = set;
		return get().then(value => {
			this._cache = value;
			return this;
		});
	}
	get() {
		return this._cache;
	}
	set(value) {
		this._cache = value;
		return this._set(value);
	}
}

