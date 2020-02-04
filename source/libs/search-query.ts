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

	// TODO: add support for values with spaces, e.g. `label:"help wanted"`
	getQueryParts(): string[] {
		return this.get().split(/\s+/);
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

	remove(...queryPartToRemove: string[]): void {
		const newQuery = this
			.getQueryParts()
			.filter(queryPart => !queryPartToRemove.includes(queryPart))
			.join(' ');

		this.set(newQuery);
	}

	includes(...searchStrings: string[]): boolean {
		return this.getQueryParts().some(queryPart => searchStrings.includes(queryPart));
	}
}
