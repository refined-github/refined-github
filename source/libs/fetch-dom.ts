import domify from 'doma';

async function fetchDom(url: string): Promise<DocumentFragment>;
async function fetchDom(url: string, selector: string): Promise<Element>; // eslint-disable-line @typescript-eslint/unified-signatures
async function fetchDom(url: string, selector?: string): Promise<Node> {
	const response = await fetch(url);
	const dom = domify(await response.text());
	return selector ? dom.querySelector(selector)! : dom;
}

export default fetchDom;
