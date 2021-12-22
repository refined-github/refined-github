type Source = HTMLAnchorElement | URL | string | string[][] | Record<string, string> | URLSearchParams;

const queryPartsRegExp = /(?:[^\s"]+|"[^"]*")+/g;
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

const labelLinkRegex = /^(?:\/[^/]+){2}\/labels\/([^/]+)\/?$/;

/**
Parser/Mutator of GitHub's search query directly on anchors and URL-like objects.
Notice: if the <a> or `location` changes outside SearchQuery, `get()` will return an outdated value.
*/
export default class SearchQuery {
	static escapeValue(value: string): string {
		return value.includes(' ') ? `"${value}"` : value;
	}

	link?: HTMLAnchorElement;
	searchParams: URLSearchParams;
	queryParts: string[];

	constructor(link: Source) {
		if (link instanceof HTMLAnchorElement) {
			this.link = link;
			this.searchParams = new URLSearchParams(link.search);
		} else if (link instanceof URL) {
			this.searchParams = link.searchParams;
		} else {
			this.searchParams = new URLSearchParams(link);
		}

		this.queryParts = this.getQueryParts();
	}

	getQueryParts(): string[] {
		const currentQuery = this.searchParams.get('q');
		if (typeof currentQuery === 'string') {
			return splitQueryString(currentQuery);
		}

		if (!this.link) {
			return [];
		}

		// Parse label links #5176
		const labelName = labelLinkRegex.exec(this.link.pathname)?.[1];
		if (labelName) {
			return ['is:open', 'label:' + SearchQuery.escapeValue(decodeURIComponent(labelName))];
		}

		// Query-less URLs imply some queries.
		// When we explicitly set ?q=* they're overridden, so they need to be manually added again.
		const queries = [];

		// Repo example: is:issue is:open
		queries.push(/\/pulls\/?$/.test(this.link.pathname) ? 'is:pr' : 'is:issue', 'is:open');

		// Header nav example: is:open is:issue author:you archived:false
		if (this.link.pathname === '/issues' || this.link.pathname === '/pulls') {
			if (this.searchParams.has('user')) { // #1211
				queries.push('user:' + this.searchParams.get('user')!);
			} else {
				queries.push('author:@me');
			}

			queries.push('archived:false');
		}

		return queries;
	}

	get(): string {
		return cleanQueryParts(this.queryParts).join(' ');
	}

	set(query: string): this {
		this.queryParts = splitQueryString(query);
		return this;
	}

	applyChanges(): void {
		this.searchParams.set('q', this.get());
		if (this.link) {
			this.link.search = String(this.searchParams);
			if (labelLinkRegex.test(this.link.pathname)) {
				// Avoid a redirection to the conversation list that would drop the search query #5176
				this.link.pathname = this.link.pathname.replace(/\/labels\/.+$/, '/issues');
			}
		}
	}

	edit(callback: (queryParts: string[]) => string[]): this {
		this.queryParts = callback(this.queryParts);
		return this;
	}

	replace(searchValue: string | RegExp, replaceValue: string): this {
		this.set(this.get().replace(searchValue, replaceValue));
		return this;
	}

	remove(...queryPartsToRemove: string[]): this {
		this.queryParts = this.queryParts.filter(queryPart => !queryPartsToRemove.includes(queryPart));
		return this;
	}

	add(...queryPartsToAdd: string[]): this {
		this.queryParts.push(...queryPartsToAdd);
		return this;
	}

	includes(...searchStrings: string[]): boolean {
		return cleanQueryParts(this.queryParts).some(queryPart => searchStrings.includes(queryPart));
	}
}
