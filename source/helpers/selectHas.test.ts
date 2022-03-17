import jsdom from 'jsdom';
import test from 'ava';

import select from './selectHas';

const {JSDOM} = jsdom;

test('basic :has() support', t => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><strong>Contacts</a>
	`);

	t.like(select('a:has(strong)', document), {textContent: 'Contacts'});
});

test('returns undefined if not found', t => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><strong>Contacts</strong></a>
	`);

	t.is(select('a:has(em)', document), undefined);
});

test('supports looking for children in base element', t => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><em>Contacts</em> <i>icon</i></a>
	`);

	t.like(select('a:has(em) i', document), {textContent: 'icon'});
});

test('throws error when there’s a space before :has()', t => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	t.throws(() => {
		select('a :has(em)', document);
	}, {
		message: 'No spaces before :has() supported',
	});
});

test('throws error when there is more than one :has()', t => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	t.throws(() => {
		select('a:has(em) b:has(strong)', document);
	}, {
		message: 'Only one `:has()` required/allowed, found 2',
	});
});

test('throws on sibling selectors', t => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	t.throws(() => {
		select('a:has(+a)', document);
	}, {
		message: 'This polyfill only supports looking into the children of the base element',
	});
});
