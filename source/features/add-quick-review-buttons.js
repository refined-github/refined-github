import {h} from 'dom-chef';
import select from 'select-dom';

const btnClassMap = {
	approve: 'btn-primary',
	reject: 'btn-danger'
};

export default function () {
	const submitButton = select('#submit-review [type="submit"]');
	if (!submitButton) {
		// Already applied
		return;
	}

	const container = select('#submit-review .form-actions');
	const radios = select.all('#submit-review [name="pull_request_review[event]"]');

	if (radios.length === 0) {
		return;
	}

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

	if (radios.length > 1) {
		container.append(
			// Move the comment button at the end
			select('#submit-review button[value="comment"]'),

			// Make it the default action for cmd+enter
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"/>,

		);
	}

	// Remove original form at last to avoid leaving a broken form
	for (const radio of radios) {
		radio.closest('.form-checkbox').remove();
	}
	submitButton.remove();
}
