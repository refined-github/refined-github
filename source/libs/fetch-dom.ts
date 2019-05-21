import domify from 'doma';
import pMemoize from 'p-memoize';

// TODO: wait for https://github.com/sindresorhus/p-memoize/issues/9
const memo = pMemoize as <T = VoidFunction>(fn: T) => T;

async function fetchDom(url: string): Promise<DocumentFragment>;
async function fetchDom<TElement extends Element>(url: string, selector: string): Promise<TElement>;
async function fetchDom(url: string, selector?: string): Promise<Node> {
	const urlObject = new URL(url, location.origin);
	const response = await fetch(String(urlObject));
	const dom = domify(await response.text());
	return selector ? dom.querySelector(selector)! : dom;
}

export default memo(fetchDom);
