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

test('getQueryParts with parentheses support', () => {
	const query = SearchQuery.from({q: 'please (label:"bug" or type:bug)'});
	assert.deepEqual(query.getQueryParts(), ['please', '(label:"bug" or type:bug)']);
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

test('.append', () => {
	const query = SearchQuery.from({q: 'is:pr birds everywhere'});
	query.append('and', 'aliens');
	assert.equal(query.get(), 'is:pr birds everywhere and aliens');
});

test('.prepend', () => {
	const query = SearchQuery.from({q: 'is:pr birds everywhere'});
	query.prepend('sort:cool', 'exclude:chicken');
	assert.equal(query.get(), 'sort:cool exclude:chicken is:pr birds everywhere');
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
	query.append('is:issue');

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

test('complex queries with multiple conditions', () => {
	const query = SearchQuery.from({q: 'is:issue is:open label:bug author:user milestone:"Q1 2023"'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'is:open', 'label:bug', 'author:user', 'milestone:"Q1 2023"']);
});

test('queries with special characters in quoted values', () => {
	const query = SearchQuery.from({q: 'label:"bug: critical!" milestone:"version 1.0-beta"'});
	assert.deepEqual(query.getQueryParts(), ['label:"bug: critical!"', 'milestone:"version 1.0-beta"']);
});

test('queries with colons in quoted values', () => {
	const query = SearchQuery.from({q: 'label:"feature: enhancement" comment:"fixes: #1234"'});
	assert.deepEqual(query.getQueryParts(), ['label:"feature: enhancement"', 'comment:"fixes: #1234"']);
});

test('queries with multiple spaces between parts', () => {
	const query = SearchQuery.from({q: 'is:issue   label:bug    author:user'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'label:bug', 'author:user']);
});

test('queries with empty quoted values', () => {
	const query = SearchQuery.from({q: 'is:issue label:""'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'label:""']);
});

test('complex parenthesized expressions', () => {
	const query = SearchQuery.from({q: 'repo:user/repo (is:issue OR is:pr) label:bug'});
	assert.deepEqual(query.getQueryParts(), ['repo:user/repo', '(is:issue OR is:pr)', 'label:bug']);
});

test('quoted strings without keys', () => {
	const query = SearchQuery.from({q: '"exact phrase search" label:bug'});
	assert.deepEqual(query.getQueryParts(), ['"exact phrase search"', 'label:bug']);
});

test('keys with special characters', () => {
	const query = SearchQuery.from({q: 'is:issue assignee-review-requested:@me'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'assignee-review-requested:@me']);
});

test('mixed key-value types in one query', () => {
	const query = SearchQuery.from({q: 'is:issue "exact match" label:"needs help" (author:user1 OR author:user2)'});
	assert.deepEqual(
		query.getQueryParts(),
		['is:issue', '"exact match"', 'label:"needs help"', '(author:user1 OR author:user2)'],
	);
});

test('queries with date ranges', () => {
	const query = SearchQuery.from({q: 'is:issue created:2023-01-01..2023-12-31'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'created:2023-01-01..2023-12-31']);
});

test('queries with negation operators', () => {
	const query = SearchQuery.from({q: 'is:issue -label:bug -author:user'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', '-label:bug', '-author:user']);
});

test('queries with comparison operators', () => {
	const query = SearchQuery.from({q: 'is:issue comments:>10 created:>=2023-01-01'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'comments:>10', 'created:>=2023-01-01']);
});

test('queries with wildcard characters', () => {
	const query = SearchQuery.from({q: 'is:issue label:bug-* author:*-bot'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'label:bug-*', 'author:*-bot']);
});

test('queries with special URL characters', () => {
	const query = SearchQuery.from({q: 'repo:user/repo-name+feature is:issue'});
	assert.deepEqual(query.getQueryParts(), ['repo:user/repo-name+feature', 'is:issue']);
});

test('queries with multiple negation patterns', () => {
	const query = SearchQuery.from({q: 'is:pr -is:draft -is:merged -label:WIP'});
	assert.deepEqual(query.getQueryParts(), ['is:pr', '-is:draft', '-is:merged', '-label:WIP']);
});

test('queries with multiple key-value pairs having the same key', () => {
	const query = SearchQuery.from({q: 'is:issue label:bug label:enhancement label:"good first issue"'});
	assert.deepEqual(query.getQueryParts(), ['is:issue', 'label:bug', 'label:enhancement', 'label:"good first issue"']);
});

test('queries with complex boolean combinations', () => {
	const query = SearchQuery.from({q: 'is:issue (label:bug AND author:user) OR (label:feature AND milestone:v1.0)'});
	assert.deepEqual(
		query.getQueryParts(),
		['is:issue', '(label:bug AND author:user)', 'OR', '(label:feature AND milestone:v1.0)'],
	);
});

test('queries with numbers and other special characters in search terms', () => {
	const query = SearchQuery.from({q: 'issue#123 PR#456 @user branch:fix/bug-123'});
	assert.deepEqual(query.getQueryParts(), ['issue#123', 'PR#456', '@user', 'branch:fix/bug-123']);
});

test('queries with dots in key values', () => {
	const query = SearchQuery.from({q: 'filename:test.js extension:.tsx repo:user/repo.js'});
	assert.deepEqual(query.getQueryParts(), ['filename:test.js', 'extension:.tsx', 'repo:user/repo.js']);
});

test('queries with unicode characters', () => {
	const query = SearchQuery.from({q: 'label:"优先级高" author:用户'});
	assert.deepEqual(query.getQueryParts(), ['label:"优先级高"', 'author:用户']);
});

test('queries with multiple parenthesized groups', () => {
	const query = SearchQuery.from({q: '(is:issue) (is:open) (label:bug) (author:user)'});
	assert.deepEqual(query.getQueryParts(), ['(is:issue)', '(is:open)', '(label:bug)', '(author:user)']);
});

test('queries with multiple quoted strings', () => {
	const query = SearchQuery.from({q: '"first string" "second string" "third string"'});
	assert.deepEqual(query.getQueryParts(), ['"first string"', '"second string"', '"third string"']);
});

test('queries with URL-encoded characters', () => {
	const query = SearchQuery.from({q: 'label:bug%20fix author:user%2Dname'});
	assert.deepEqual(query.getQueryParts(), ['label:bug%20fix', 'author:user%2Dname']);
});
