import * as pageDetect from 'github-url-detection';
import {readFileSync} from 'node:fs';
import {$, $$, $optional} from 'select-dom';
import {assert, beforeEach, test} from 'vitest';

import {listAuthorSelector} from './selectors.js';

const fixture = readFileSync('source/github-helpers/fixtures/list-authors.html', 'utf8');

beforeEach(() => {
	document.body.innerHTML = fixture;
});

test('normalized observed authors and legacy regression', () => {
	assert.lengthOf($$(listAuthorSelector), 6);
	assert.isUndefined($optional(`#assignee :is(${listAuthorSelector.join(',')})`));
	assert.isUndefined($optional(`#inbox :is(${listAuthorSelector.join(',')})`));
	assert.isFalse($('[data-testid="repo-filter-link"]').matches(listAuthorSelector.join(',')));
});

test.each([
	'/pulls',
	'/pulls/authored',
	'/pulls/assigned',
	'/pulls/search?q=is%3Apr',
	'/issues',
	'/issues/assigned',
	'/example/project/pulls',
	'/example/project/issues',
])(
	'installed page detection activates list features: %s',
	path => {
		assert.isTrue(pageDetect.isIssueOrPRList(new URL(path, location.origin)));
		location.assign(new URL(path, location.origin));
		assert.isTrue(pageDetect.isIssueOrPRList(), 'Same predicate after in-site URL change');
		assert.equal(pageDetect.isRepoIssueList(), path === '/example/project/issues');
	},
);

test('inbox is recognized, but has no supported author element', () => {
	assert.isTrue(pageDetect.isIssueOrPRList(new URL('/pulls/inbox', location.origin)));
	assert.isUndefined($optional(`#inbox :is(${listAuthorSelector.join(',')})`));
});
