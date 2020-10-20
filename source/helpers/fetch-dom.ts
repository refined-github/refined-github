import mem from 'mem';
import domify from 'doma';

async function fetchDom(url: string): Promise<DocumentFragment>;
async function fetchDom<TElement extends Element>(url: string, selector: string, backgroundRequest?: boolean): Promise<TElement | undefined>;
async function fetchDom(url: string, selector?: string, backgroundRequest?: boolean): Promise<Node | undefined> {
	const absoluteURL = new URL(url, location.origin).toString(); // Firefox `fetch`es from the content script, so relative URLs fail
	const response = backgroundRequest ? await browser.runtime.sendMessage({request: absoluteURL}) : await fetch(absoluteURL);
	const dom = domify(await response.text?.() ?? response);
	if (selector) {
		return dom.querySelector(selector) ?? undefined;
	}

	return dom;
}

export default mem(fetchDom);
