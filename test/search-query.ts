import test from 'ava';
import './fixtures/globals';
import SearchQuery from '../source/libs/search-query';

test('.get', t => {
	const query = new SearchQuery(new URLSearchParams('?q=wow'));
	t.is(query.get(), 'wow');
});

test('.getQueryParts', t => {
	const query = new SearchQuery(new URLSearchParams('?q=cool+is%3Aissue'));
	t.deepEqual(query.getQueryParts(), ['cool', 'is:issue']);
});

test.failing('getQueryParts with spaces support', t => {
	const query = new SearchQuery(new URLSearchParams('?q=please+label%3A"under+discussion"'));
	t.deepEqual(query.getQueryParts(), ['please', 'label:"under discussion"']);
});

test('.set', t => {
	const query = new SearchQuery(new URLSearchParams('?q=wow'));
	query.set('lol');
	t.is(query.get(), 'lol');
});

test('.edit', t => {
	const query = new SearchQuery(new URLSearchParams('?q=gone+fishing'));
	query.edit(query => query.split(' ')[0]);
	t.is(query.get(), 'gone');
});

test('.replace', t => {
	const query = new SearchQuery(new URLSearchParams('?q=404+error'));
	query.replace('error', 'failure');
	t.is(query.get(), '404 failure');

	query.replace(/^\d(\d)/, '1$1');
	t.is(query.get(), '104 failure');
});

test('.remove', t => {
	const query = new SearchQuery(new URLSearchParams('?q=is%3Aissue+dog+is%3Aopen'));
	query.remove('is:issue', 'is:open');
	t.is(query.get(), 'dog');
});

test('.add', t => {
	const query = new SearchQuery(new URLSearchParams('?q=is%3Apr+birds+everywhere'));
	query.add('and', 'aliens');
	t.is(query.get(), 'is:pr birds everywhere and aliens');
});

test('.includes', t => {
	const query = new SearchQuery(new URLSearchParams('?q=label:nonsense'));
	t.false(query.includes('nonsense'));
	t.true(query.includes('label:nonsense'));
});

test('defaults', t => {
	const query = new SearchQuery(new URLSearchParams('?q='));
	t.is(query.get(), '');

	const link = document.createElement('a');
	link.href = '/issues';
	const queryWithLink = new SearchQuery(link);
	t.is(queryWithLink.get(), 'is:issue is:open');
});
