import mem from 'mem';
import domify from 'doma';

import type {ParseSelector} from 'typed-query-selector/parser';

async function fetchDom(url: string): Promise<DocumentFragment>;
async function fetchDom<Selector extends string, TElement extends HTMLElement = ParseSelector<Selector, HTMLElement>>(url: string, selector: Selector): Promise<TElement | undefined>;
async function fetchDom(url: string, selector?: string): Promise<Node | undefined> {
	const absoluteURL = new URL(url, location.origin).toString(); // Firefox `fetch`es from the content script, so relative URLs fail
	const response = await fetch(absoluteURL);
	const dom = domify(await response.text());
	if (selector) {
		return dom.querySelector(selector) ?? undefined;
	}

	return dom;
}

export default mem(fetchDom);
