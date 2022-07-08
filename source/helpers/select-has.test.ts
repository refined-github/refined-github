import {expect, test} from 'vitest';

import jsdom from 'jsdom';

import select from './select-has';

const {JSDOM} = jsdom;

test('basic :has() support', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><strong>Contacts</a>
	`);

	expect(select('a:has(strong)', document)).toMatchObject({textContent: 'Contacts'});
});

test('returns undefined if not found', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><strong>Contacts</strong></a>
	`);

	expect(select('a:has(em)', document)).toBe(undefined);
});

test('supports looking for descendants in base element', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><em>Contacts</em> <i>icon</i></a>
	`);

	expect(select('a:has(em) i', document)).toMatchObject({textContent: 'icon'});
});

test('supports looking for direct children in base element', () => {
	const {window: {document}} = new JSDOM(`
		<a><em><span>Home <i></i></span></em></a>
		<a><span><em>Contacts <i></i></em></span></a>
	`);

	expect(select('a:has(> span i)', document)).toMatchObject({textContent: 'Contacts '});
});

test('throws error when there’s a space before :has()', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	expect(() => {
		select('a :has(em)', document);
	}).toThrowError(
		'No spaces before :has() supported',
	);
});

test('throws error when there is more than one :has()', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	expect(() => {
		select('a:has(em) b:has(strong)', document);
	}).toThrowError('Only one `:has()` required/allowed, found 2',
	);
});

test('throws on sibling selectors', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	expect(() => {
		select('a:has(+a)', document);
	}).toThrowError('This polyfill only supports looking into the children of the base element',
	);
});
