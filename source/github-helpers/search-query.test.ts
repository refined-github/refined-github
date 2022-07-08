import {expect, test} from 'vitest';

import SearchQuery from './search-query';

test('.get', () => {
	const query = SearchQuery.from({q: 'wow'});
	expect(query.get()).toBe('wow');
});

test('.getQueryParts', () => {
	const query = SearchQuery.from({q: 'cool is:issue'});
	expect(query.getQueryParts()).toEqual(['cool', 'is:issue']);
});

test('getQueryParts with spaces support', () => {
	const query = SearchQuery.from({q: 'please label:"under discussion"'});
	expect(query.getQueryParts()).toEqual(['please', 'label:"under discussion"']);
});

test('.set', () => {
	const query = SearchQuery.from({q: 'wow'});
	query.set('lol');
	expect(query.get()).toBe('lol');
});

test('.edit', () => {
	const query = SearchQuery.from({q: 'gone fishing'});
	query.edit(queryParts => queryParts.slice(0, 1));
	expect(query.get()).toBe('gone');
});

test('.replace', () => {
	const query = SearchQuery.from({q: '404 error'});
	query.replace('error', 'failure');
	expect(query.get()).toBe('404 failure');

	query.replace(/^\d(\d)/, '1$1');
	expect(query.get()).toBe('104 failure');
});

test('.remove', () => {
	const query = SearchQuery.from({q: 'is:issue dog is:open'});
	query.remove('is:issue', 'is:open');
	expect(query.get()).toBe('dog');
});

test('.add', () => {
	const query = SearchQuery.from({q: 'is:pr birds everywhere'});
	query.add('and', 'aliens');
	expect(query.get()).toBe('is:pr birds everywhere and aliens');
});

test('.includes', () => {
	const query = SearchQuery.from({q: 'label:nonsense'});
	expect(query.includes('nonsense')).toBe(false);
	expect(query.includes('label:nonsense')).toBe(true);
});

test('defaults', () => {
	const query = SearchQuery.from({q: ''});
	expect(query.get()).toBe('');

	const link = document.createElement('a');
	link.href = 'https://github.com/owner/repo/issues';
	const queryFromLink = SearchQuery.from(link);
	expect(queryFromLink.get()).toBe('is:issue is:open');
});

test('deduplicate is:pr/issue', () => {
	const query = SearchQuery.from({q: 'refined github is:pr'});
	query.add('is:issue');

	expect(query.includes('is:pr')).toBe(false);
	expect(query.includes('is:issue')).toBe(true);
});

test('remove additional spaces', () => {
	const query = SearchQuery.from({q: ' refined   github '});
	expect(query.get()).toBe('refined github');
});

test('parse label link', () => {
	const link = document.createElement('a');
	link.href = 'https://github.com/owner/repo/labels/bug';
	const query = SearchQuery.from(link);

	expect(query.get()).toBe('is:open label:bug');
	expect(query.href.startsWith('https://github.com/owner/repo/issues?')).toBe(true);
});
