type Source = HTMLAnchorElement | URL | URLSearchParams | Location;

/**
Parser/Mutator of GitHub's search query directly on anchors and URL-like objects.
Notice: if the <a> or `location` changes outside SearchQuery, `get()` will return an outdated value.
*/
export default class SearchQuery {
	searchParams: URLSearchParams;

	constructor(link: Source) {
		if (link instanceof HTMLAnchorElement || link instanceof Location) {
			this.searchParams = new URLSearchParams(link.search);
			// Keep `.search` property up to date with this `searchParams`
			const nativeSet = this.searchParams.set;
			this.searchParams.set = (name, value) => {
				nativeSet.call(this.searchParams, name, value);
				link.search = String(this.searchParams);
			};
		} else if (link instanceof URL) {
			this.searchParams = link.searchParams;
		} else {
			this.searchParams = link;
		}
	}

	get(): string {
		return this.searchParams.get('q') ?? '';
	}

	set(newQuery: string): void {
		const cleanQuery = newQuery.trim().replace(/\s+/, ' ');
		this.searchParams.set('q', cleanQuery);
	}

	edit(callback: (query: string) => string): void {
		this.set(callback(this.get()));
	}

	replace(searchValue: string | RegExp, replaceValue: string): void {
		this.set(this.get().replace(searchValue, replaceValue));
	}

	removeByRegex(queryPartToRemove: RegExp): void {
		if (queryPartToRemove instanceof RegExp && queryPartToRemove.global) {
			throw new TypeError('The `g` flag on RegExp can’t be used here because it will lead to unexpected results (and is unnecessary)');
		}

		const newQuery = this
			.get()
			.split(/\s+/)
			.filter(queryPart => !queryPartToRemove.test(queryPart))
			.join(' ');

		this.set(newQuery);
	}

	remove(...queryPartToRemove: string[]): void {
		const newQuery = this
			.get()
			.split(/\s+/)
			.filter(queryPart => !queryPartToRemove.includes(queryPart))
			.join(' ');

		this.set(newQuery);
	}

	includes(...searchStrings: string[]): boolean {
		return this
			.get()
			.split(/\s+/)
			.some(queryPart => searchStrings.includes(queryPart));
	}
}
