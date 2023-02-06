import {find, parse, generate} from 'css-tree';

const ast = parse('/*!comment*/.a { color: red; }');

const firstColorDeclaration = find(ast, console.log);

console.log(firstColorDeclaration);

// Const fetchDocument = mem(async (url: string): Promise<JSDOM> => JSDOM.fromURL(url));

// describe.concurrent('selectors', () => {
// 	// Exclude URL arrays
// 	const selectors: Array<[name: string, selector: string]> = [];
// 	for (const [name, selector] of Object.entries(exports)) {
// 		if (!Array.isArray(selector)) {
// 			selectors.push([name, selector]);
// 		}
// 	}

// 	test.each(selectors)('%s', async (name, selector) => {
// 		// @ts-expect-error Index signature bs
// 		const urls = exports[name + '_'] as string[];

// 		assert.isArray(urls, `No URLs defined for "${name}"`);
// 		await Promise.all(urls.map(async url => {
// 			const {window} = await fetchDocument(url);
// 			assert.isDefined(window.document.querySelector(selector));
// 		}));
// 	});
// });
