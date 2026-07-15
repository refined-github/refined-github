import {$} from 'select-dom';
import {beforeEach, describe, expect, test} from 'vitest';

import {getReviewControls} from './review-submission.js';

function reviewAction(value: string, label: string): string {
	const id = `review-${value.replace(' ', '-')}`;
	return `
		<input id="${id}" type="radio" name="reviewEvent" value="${value}">
		<label for="${id}">
			<span class="text-bold">${label}</span>
			<span>${label} description</span>
		</label>
	`;
}

function reviewDialog(): string {
	return `
		<div role="dialog">
			<h1>Finish your comments</h1>
			<fieldset data-component="RadioGroup">
				<legend><span data-component="RadioGroup.Label">Review event</span></legend>
				${reviewAction('comment', 'Comment')}
				${reviewAction('approve', 'Approve')}
				${reviewAction('request changes', 'Request changes')}
			</fieldset>
			<div class="footer-actions">
				<button type="button">Cancel</button>
				<div data-loading-wrapper="true">
					<button type="button" data-variant="primary">Submit comments</button>
				</div>
			</div>
		</div>
	`;
}

describe('review submission controls', () => {
	beforeEach(() => {
		document.body.innerHTML = reviewDialog();
	});

	test('recognizes the native review controls before replacement', () => {
		const controls = getReviewControls($('fieldset'));

		expect(controls.actions).toEqual([
			{value: 'comment', label: 'Comment', description: 'Comment description', disabled: false},
			{value: 'approve', label: 'Approve', description: 'Approve description', disabled: false},
			{value: 'request changes', label: 'Request changes', description: 'Request changes description', disabled: false},
		]);
		expect(controls.nativeSubmitButton.textContent).toBe('Submit comments');
	});

	test('rejects an unexpected native review action', () => {
		$('input[value="request changes"]').setAttribute('value', 'reject');

		expect(() => getReviewControls($('fieldset'))).toThrow('Unexpected review action: reject');
	});
});
