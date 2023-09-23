const queryPartsRegExp = /(?:[^\s"]+|"[^"]*")+/g;
const labelLinkRegex = /^(?:\/[^/]+){2}\/labels\/([^/]+)\/?$/;

function splitQueryString(query: string): string[] {
	return query.match(queryPartsRegExp) ?? [];
}

// Remove all keywords from array except the last occurrence of one of the keywords.
function deduplicateKeywords(array: string[], ...keywords: string[]): string[] {
	const deduplicated = [];
	let wasKeywordFound = false;
	for (const current of [...array].reverse()) {
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

type Source = Location | HTMLAnchorElement | Record<string, string>;

/**
Parser/Mutator of GitHub's search query directly on anchors and URL-like objects.
Notice: if the <a> or `location` changes outside SearchQuery, `get()` will return an outdated value.
*/
export default class SearchQuery {
	static escapeValue(value: string): string {
		return value.includes(' ') ? `"${value}"` : value;
	}

	static from(source: Source): SearchQuery {
		if (source instanceof Location || source instanceof HTMLAnchorElement) {
			return new SearchQuery(source.href);
		}

		const url = new URL('https://github.com');
		for (const [name, value] of Object.entries(source)) {
			url.searchParams.set(name, value);
		}

		return new SearchQuery(url);
	}

	private readonly url: URL;
	private queryParts: string[];

	constructor(url: string | URL, base?: string) {
		this.url = new URL(String(url), base);
		this.queryParts = [];

		const currentQuery = this.url.searchParams.get('q');
		if (typeof currentQuery === 'string') {
			this.queryParts = splitQueryString(currentQuery);
			return;
		}

		// Parse label links #5176
		const labelName = labelLinkRegex.exec(this.url.pathname)?.[1];
		if (labelName) {
			this.queryParts = ['is:open', 'label:' + SearchQuery.escapeValue(decodeURIComponent(labelName))];
			return;
		}

		// Query-less URLs imply some queries.
		// When we explicitly set ?q=* they're overridden, so they need to be manually added again.

		// Repo example: is:issue is:open
		this.queryParts.push(/\/pulls\/?$/.test(this.url.pathname) ? 'is:pr' : 'is:issue', 'is:open');

		// Header nav example: is:open is:issue author:you archived:false
		if (this.url.pathname === '/issues' || this.url.pathname === '/pulls') {
			if (this.url.searchParams.has('user')) { // #1211
				this.queryParts.push('user:' + this.url.searchParams.get('user')!);
			} else {
				this.queryParts.push('author:@me');
			}

			this.queryParts.push('archived:false');
		}
	}

	getQueryParts(): string[] {
		return cleanQueryParts(this.queryParts);
	}

	get(): string {
		return this.getQueryParts().join(' ');
	}

	set(query: string): this {
		this.queryParts = splitQueryString(query);
		return this;
	}

	get searchParams(): URLSearchParams {
		return this.url.searchParams;
	}

	get href(): string {
		this.url.searchParams.set('q', this.get());
		if (labelLinkRegex.test(this.url.pathname)) {
			// Avoid a redirection to the conversation list that would drop the search query #5176
			this.url.pathname = this.url.pathname.replace(/\/labels\/.+$/, '/issues');
		}

		return this.url.href;
	}

	edit(callback: (queryParts: string[]) => string[]): this {
		this.queryParts = callback(this.getQueryParts());
		return this;
	}

	replace(searchValue: string | RegExp, replaceValue: string): this {
		this.set(this.get().replace(searchValue, replaceValue));
		return this;
	}

	remove(...queryPartsToRemove: string[]): this {
		this.queryParts = this.getQueryParts().filter(queryPart => !queryPartsToRemove.includes(queryPart));
		return this;
	}

	add(...queryPartsToAdd: string[]): this {
		this.queryParts.push(...queryPartsToAdd);
		return this;
	}

	includes(...searchStrings: string[]): boolean {
		return this.getQueryParts().some(queryPart => searchStrings.includes(queryPart));
	}
}
