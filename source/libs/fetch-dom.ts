import domify from 'doma';
import mem from 'mem';

async function fetchDom(url: string): Promise<DocumentFragment>;
async function fetchDom<TElement extends Element>(url: string, selector: string): Promise<TElement>;
async function fetchDom(url: string, selector?: string): Promise<Node> {
	const urlObject = new URL(url, location.origin);
	const response = await fetch(String(urlObject));
	const dom = domify(await response.text());
	return selector ? dom.querySelector(selector)! : dom;
}

export default mem(fetchDom);
