import {h} from 'dom-chef';
import select from 'select-dom';

const btnClassMap = {
	approve: 'btn-primary',
	reject: 'btn-danger'
};

export default function () {
	const submitButton = select('#submit-review [type="submit"]');
	const container = select('#submit-review .form-actions');
	const radios = select.all('#submit-review [type="radio"][name="pull_request_review[event]"]');

	if (radios.length === 0) {
		return;
	}

	// Set the default action for cmd+enter to Comment
	if (radios.length > 1) {
		container.append(
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"/>,

		);
	}

	// Generate the new buttons
	for (const radio of radios) {
		if (!radio.disabled) {
			container.append(
				<button
					name="pull_request_review[event]"
					value={radio.value}
					class={`btn btn-sm ${btnClassMap[radio.value] || ''}`}>
					{radio.nextSibling.textContent.trim()}
				</button>
			);
		}
	}

	// Make sure that the comment and cancel buttons are last
	if (radios.length > 1) {
		container.append(select('#submit-review button[value="comment"]'));
		const cancelReview = select('#submit-review .review-cancel-button');
		if (cancelReview) {
			cancelReview.classList.add('float-left');
			container.append(cancelReview);
		}
	}

	// Remove original fields at last to avoid leaving a broken form
	for (const radio of radios) {
		radio.closest('.form-checkbox').remove();
	}
	submitButton.remove();
}
