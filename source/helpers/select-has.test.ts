import {JSDOM} from 'jsdom';
import {test, assert} from 'vitest';

import select from './select-has';

test('basic :has() support', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><strong>Contacts</a>
	`);

	assert.propertyVal(select('a:has(strong)', document), 'textContent', 'Contacts');
});

test('returns undefined if not found', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><strong>Contacts</strong></a>
	`);

	assert.equal(select('a:has(em)', document), undefined);
});

test('supports looking for descendants in base element', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
		<a><em>Contacts</em> <i>icon</i></a>
	`);

	assert.propertyVal(select('a:has(em) i', document), 'textContent', 'icon');
});

test('supports looking for direct children in base element', () => {
	const {window: {document}} = new JSDOM(`
		<a><em><span>Home <i></i></span></em></a>
		<a><span><em>Contacts <i></i></em></span></a>
	`);

	assert.propertyVal(select('a:has(> span i)', document), 'textContent', 'Contacts ');
});

test('throws error when there’s a space before :has()', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	assert.throws(() => {
		select('a :has(em)', document);
	}, 'No spaces before :has() supported');
});

test('throws error when there is more than one :has()', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	assert.throws(() => {
		select('a:has(em) b:has(strong)', document);
	}, 'Only one `:has()` required/allowed, found 2');
});

test('throws on sibling selectors', () => {
	const {window: {document}} = new JSDOM(`
		<a>Home</a>
	`);

	assert.throws(() => {
		select('a:has(+a)', document);
	}, 'This polyfill only supports looking into the children of the base element');
});
