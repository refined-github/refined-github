import {getUsername} from '.';

type Source = HTMLAnchorElement | URL | string | string[][] | Record<string, string> | URLSearchParams;

const queryPartsRegExp = /(?:[^\s"]+|"[^"]*")+/g;
function splitQueryString(query: string): string[] {
	return query.match(queryPartsRegExp) ?? [];
}

// Remove all keywords from array exept the last occurence of one of the keywords.
function deduplicateKeywords(array: string[], ...keywords: string[]): string[] {
	const deduplicated = [];
	let wasKeywordFound = false;
	for (const current of array.reverse()) {
		const isKeyword = keywords.includes(current);
		if (!isKeyword || !wasKeywordFound) {
			deduplicated.unshift(current);
			wasKeywordFound = wasKeywordFound || isKeyword;
		}
	}

	return deduplicated;
}

function cleanQueryParts(parts: string[]): string[] {
	return deduplicateKeywords(parts, 'is:issue', 'is:pr');
}

/**
Parser/Mutator of GitHub's search query directly on anchors and URL-like objects.
Notice: if the <a> or `location` changes outside SearchQuery, `get()` will return an outdated value.
*/
export default class SearchQuery {
	link?: HTMLAnchorElement;
	searchParams: URLSearchParams;

	constructor(link: Source) {
		if (link instanceof HTMLAnchorElement) {
			this.link = link;
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
			this.searchParams = new URLSearchParams(link);
		}

		// Ensure the query string is set and cleaned up
		this.set(this.get());
	}

	get(): string {
		const currentQuery = this.searchParams.get('q');
		if (typeof currentQuery === 'string') {
			return currentQuery;
		}

		if (!this.link) {
			return '';
		}

		// Query-less URLs imply some queries.
		// When we explicitly set ?q=* they're overridden, so they need to be manually added again.
		const queries = [];

		// Repo example: is:issue is:open
		queries.push(/\/pulls\/?$/.test(this.link.pathname) ? 'is:pr' : 'is:issue', 'is:open');

		// Header nav example: is:open is:issue author:you archived:false
		if (this.link.pathname === '/issues' || this.link.pathname === '/pulls') {
			if (this.searchParams.has('user')) { // #1211
				queries.push(`user:${this.searchParams.get('user')!}`);
			} else {
				queries.push(`author:${getUsername()}`);
			}

			queries.push('archived:false');
		}

		return queries.join(' ');
	}

	// TODO: add support for values with spaces, e.g. `label:"help wanted"`
	getQueryParts(): string[] {
		return splitQueryString(this.get());
	}

	set(query: string): void {
		const parts = splitQueryString(query);
		const cleaned = cleanQueryParts(parts);
		this.searchParams.set('q', cleaned.join(' '));
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

	add(...queryParts: string[]): void {
		const newQuery = this.getQueryParts();
		newQuery.push(...queryParts);
		this.set(newQuery.join(' '));
	}

	includes(...searchStrings: string[]): boolean {
		return this.getQueryParts().some(queryPart => searchStrings.includes(queryPart));
	}
}
