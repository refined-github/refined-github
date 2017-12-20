import {h} from 'dom-chef';
import select from 'select-dom';

export default function () {
	const submitButton = select('#submit-review [type="submit"]');
	if (!submitButton) {
		// Already applied
		return;
	}

	const container = select('#submit-review .form-actions');
	const approveCheck = select('#submit-review [value="approve"]');
	const commentCheck = select('#submit-review [value="comment"]');
	const rejectCheck = select('#submit-review [value="reject"]');

	if (!approveCheck.disabled) {
		container.append(
			<button
				name="pull_request_review[event]"
				value="approve"
				class="btn btn-sm btn-primary">
				Approve
			</button>
		);
	}
	if (!rejectCheck.disabled) {
		container.append(
			<button
				name="pull_request_review[event]"
				value="reject"
				class="btn btn-sm btn-danger">
				Request changes
			</button>
		);
	}
	if (!commentCheck.disabled) {
		container.append(
			<button
				name="pull_request_review[event]"
				value="comment"
				class="btn btn-sm">
				Comment
			</button>,
			<input
				type="hidden"
				name="pull_request_review[event]"
				value="comment"/> // This defaults cmd+enter to Comment when there's more than one field
		);
	}

	// Remove original form at last to avoid leaving a broken form,
	// if at least one option is available.
	if (!approveCheck.disabled || !rejectCheck.disabled || !commentCheck.disabled) {
		approveCheck.closest('.form-checkbox').remove();
		commentCheck.closest('.form-checkbox').remove();
		rejectCheck.closest('.form-checkbox').remove();
		submitButton.remove();
	}
}
