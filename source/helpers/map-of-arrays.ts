export default class ArrayMap<Key, Value> extends Map<Key, Value[]> {
	append(key: Key, ...values: Value[]): void {
		if (!this.has(key)) {
			this.set(key, []);
		}

		this.get(key)!.push(...values);
	}
}
