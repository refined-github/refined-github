import {test, assert} from 'vitest';

import SearchQuery from './search-query.js';

test('.get', () => {
	const query = SearchQuery.from({q: 'wow'});
	assert.equal(query.get(), 'wow');
});

test('.getQueryParts', () => {
	const query = SearchQuery.from({q: 'cool is:issue'});
	assert.deepEqual(query.getQueryParts(), ['cool', 'is:issue']);
});

test('getQueryParts with spaces support', () => {
	const query = SearchQuery.from({q: 'please label:"under discussion"'});
	assert.deepEqual(query.getQueryParts(), ['please', 'label:"under discussion"']);
});

test('.set', () => {
	const query = SearchQuery.from({q: 'wow'});
	query.set('lol');
	assert.equal(query.get(), 'lol');
});

test('.edit', () => {
	const query = SearchQuery.from({q: 'gone fishing'});
	query.edit(queryParts => queryParts.slice(0, 1));
	assert.equal(query.get(), 'gone');
});

test('.replace', () => {
	const query = SearchQuery.from({q: '404 error'});
	query.replace('error', 'failure');
	assert.equal(query.get(), '404 failure');

	query.replace(/^\d(\d)/, '1$1');
	assert.equal(query.get(), '104 failure');
});

test('.remove', () => {
	const query = SearchQuery.from({q: 'is:issue dog is:open'});
	query.remove('is:issue', 'is:open');
	assert.equal(query.get(), 'dog');
});

test('.add', () => {
	const query = SearchQuery.from({q: 'is:pr birds everywhere'});
	query.add('and', 'aliens');
	assert.equal(query.get(), 'is:pr birds everywhere and aliens');
});

test('.includes', () => {
	const query = SearchQuery.from({q: 'label:nonsense'});
	assert.isFalse(query.includes('nonsense'));
	assert.isTrue(query.includes('label:nonsense'));
});

test('defaults', () => {
	const query = SearchQuery.from({q: ''});
	assert.equal(query.get(), '');

	const link = document.createElement('a');
	link.href = 'https://github.com/owner/repo/issues';
	const queryFromLink = SearchQuery.from(link);
	assert.equal(queryFromLink.get(), 'is:issue is:open');
});

test('deduplicate is:pr/issue', () => {
	const query = SearchQuery.from({q: 'refined github is:pr'});
	query.add('is:issue');

	assert.isFalse(query.includes('is:pr'));
	assert.isTrue(query.includes('is:issue'));
});

test('remove additional spaces', () => {
	const query = SearchQuery.from({q: ' refined   github '});
	assert.equal(query.get(), 'refined github');
});

test('parse label link', () => {
	const link = document.createElement('a');
	link.href = 'https://github.com/owner/repo/labels/bug';
	const query = SearchQuery.from(link);

	assert.equal(query.get(), 'is:open label:bug');
	assert.isTrue(query.href.startsWith('https://github.com/owner/repo/issues?'));
});
