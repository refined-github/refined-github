import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const btnClassMap = {
	approve: 'btn-primary',
	reject: 'btn-danger'
};

function init(): false | void {
	const form = select('[action$="/reviews"]')!;
	const radios = select.all<HTMLInputElement>('[type="radio"][name="pull_request_review[event]"]', form);

	if (radios.length === 0) {
		return false;
	}

	const submitButton = select<HTMLInputElement>('[type="submit"]', form)!;
	const container = select('.form-actions', form)!;

	// Set the default action for cmd+enter to Comment
	if (radios.length > 1) {
		container.append(
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"/>
		);
	}

	// Generate the new buttons
	for (const radio of radios) {
		const tooltip = radio.parentElement!.getAttribute('aria-label');

		container.append(
			<button
				name="pull_request_review[event]"
				value={radio.value}
				class={`btn btn-sm ${btnClassMap[radio.value] || ''} ${tooltip ? 'tooltipped tooltipped-nw tooltipped-no-delay' : ''}`}
				aria-label={tooltip || false}
				disabled={radio.disabled}>
				{radio.nextSibling}
			</button>
		);
	}

	// Comment button must be last; cancel button must be first
	if (radios.length > 1) {
		container.append(select('button[value="comment"]', form)!);
		const cancelReview = select('.review-cancel-button', form);
		if (cancelReview) {
			cancelReview.classList.add('float-left');
			container.prepend(cancelReview);
		}
	}

	// Remove original fields at last to avoid leaving a broken form
	for (const radio of radios) {
		radio.closest('.form-checkbox')!.remove();
	}

	submitButton.remove();

	// Freeze form to avoid duplicate submissions
	form.addEventListener('submit', () => {
		// Delay disabling the fields to let them be submitted first
		setTimeout(() => {
			for (const control of select.all<HTMLButtonElement | HTMLTextAreaElement>('button, textarea', form)) {
				control.disabled = true;
			}
		});
	});
}

features.add({
	id: 'quick-review-buttons',
	include: [
		features.isPR
	],
	load: features.onAjaxedPages,
	init
});
