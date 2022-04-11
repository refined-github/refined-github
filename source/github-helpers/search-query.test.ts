import test from 'ava';

import '../../test/fixtures/globals';
import SearchQuery from './search-query';

test('.get', t => {
	const query = SearchQuery.from({q: 'wow'});
	t.is(query.get(), 'wow');
});

test('.getQueryParts', t => {
	const query = SearchQuery.from({q: 'cool is:issue'});
	t.deepEqual(query.getQueryParts(), ['cool', 'is:issue']);
});

test('getQueryParts with spaces support', t => {
	const query = SearchQuery.from({q: 'please label:"under discussion"'});
	t.deepEqual(query.getQueryParts(), ['please', 'label:"under discussion"']);
});

test('.set', t => {
	const query = SearchQuery.from({q: 'wow'});
	query.set('lol');
	t.is(query.get(), 'lol');
});

test('.edit', t => {
	const query = SearchQuery.from({q: 'gone fishing'});
	query.edit(queryParts => queryParts.slice(0, 1));
	t.is(query.get(), 'gone');
});

test('.replace', t => {
	const query = SearchQuery.from({q: '404 error'});
	query.replace('error', 'failure');
	t.is(query.get(), '404 failure');

	query.replace(/^\d(\d)/, '1$1');
	t.is(query.get(), '104 failure');
});

test('.remove', t => {
	const query = SearchQuery.from({q: 'is:issue dog is:open'});
	query.remove('is:issue', 'is:open');
	t.is(query.get(), 'dog');
});

test('.add', t => {
	const query = SearchQuery.from({q: 'is:pr birds everywhere'});
	query.add('and', 'aliens');
	t.is(query.get(), 'is:pr birds everywhere and aliens');
});

test('.includes', t => {
	const query = SearchQuery.from({q: 'label:nonsense'});
	t.false(query.includes('nonsense'));
	t.true(query.includes('label:nonsense'));
});

test('defaults', t => {
	const query = SearchQuery.from({q: ''});
	t.is(query.get(), '');

	const link = document.createElement('a');
	link.href = 'https://github.com/owner/repo/issues';
	const queryFromLink = SearchQuery.from(link);
	t.is(queryFromLink.get(), 'is:issue is:open');
});

test('deduplicate is:pr/issue', t => {
	const query = SearchQuery.from({q: 'refined github is:pr'});
	query.add('is:issue');

	t.false(query.includes('is:pr'));
	t.true(query.includes('is:issue'));
});

test('remove additional spaces', t => {
	const query = SearchQuery.from({q: ' refined   github '});
	t.is(query.get(), 'refined github');
});

test('parse label link', t => {
	const link = document.createElement('a');
	link.href = 'https://github.com/owner/repo/labels/bug';
	const query = SearchQuery.from(link);

	t.is(query.get(), 'is:open label:bug');
	t.true(query.href.startsWith('https://github.com/owner/repo/issues?'));
});
