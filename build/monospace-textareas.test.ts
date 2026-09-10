import {readFileSync} from 'node:fs';
import {$} from 'select-dom';
import {assert, test} from 'vitest';

test('monospace-textareas only styles the editable PR title in the page header', () => {
	const style = document.createElement('style');
	style.textContent = readFileSync('source/features/monospace-textareas.css', 'utf8');

	const pageHeader = document.createElement('div');
	pageHeader.className = 'prc-PageLayout-HeaderContent-test';
	pageHeader.innerHTML = `
		<form><input aria-label="Edit pull request title"></form>
		<div><input aria-label="Search all issues"></div>
	`;

	document.head.append(style);
	document.body.append(pageHeader);

	try {
		const titleInput = $('[aria-label="Edit pull request title"]', pageHeader);
		const searchInput = $('[aria-label="Search all issues"]', pageHeader);

		assert.include(getComputedStyle(titleInput).fontFamily, 'ui-monospace');
		assert.notInclude(getComputedStyle(searchInput).fontFamily, 'ui-monospace');
	} finally {
		style.remove();
		pageHeader.remove();
	}
});
