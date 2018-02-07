import {h} from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import delegate from 'delegate';
import {observeEl} from '../libs/utils';
import * as prCiStatus from '../libs/pr-ci-status';
import * as icons from '../libs/icons';

let waiting;

// Reuse the same checkbox to preserve its status
const generateCheckbox = onetime(() => (
	<label class="d-inline-block">
		<input type="checkbox" name="rgh-pr-check-waiter" checked/>
		{' Wait for successful checks '}
		<a class="discussion-item-help tooltipped tooltipped-n rgh-tooltipped" href="https://github.com/sindresorhus/refined-github/pull/975" aria-label="This only works if you keep this tab open while waiting">
			{icons.info()}
		</a>
	</label>
));

function canMerge() {
	return select.exists('.merge-message [type="submit"]:not(:disabled)');
}

function getCheckbox() {
	return select('[name="rgh-pr-check-waiter"]');
}

// Only show the checkbox if there's a pending commit
function showCheckboxIfNecessary() {
	const checkbox = getCheckbox();
	const isNecessary = true;
	if (!checkbox && isNecessary) {
		const container = select('.commit-form-actions .select-menu');
		if (container) {
			container.append(generateCheckbox());
		}
	} else if (checkbox && !isNecessary) {
		checkbox.parentNode.remove();
	}
}

function disableForm(disabled = true) {
	for (const field of select.all(`
		[name="commit_message"],
		[name="commit_title"],
		[name="rgh-pr-check-waiter"],
		.js-merge-commit-button
		`)) {
		field.disabled = disabled;
	}

	// Enabled form = no waiting in progress
	if (!disabled) {
		waiting = undefined;
	}
}

async function handleMergeConfirmation(event) {
	const checkbox = getCheckbox();
	if (checkbox && checkbox.checked) {
		event.preventDefault();

		disableForm();
		const currentConfirmation = Symbol('');
		waiting = currentConfirmation;
		const status = await prCiStatus.wait();

		// Ensure that it wasn't cancelled/changed in the meanwhile
		if (waiting === currentConfirmation) {
			disableForm(false);

			if (status === prCiStatus.SUCCESS) {
				event.target.click();
			}
		}
	}
}

export default function () {
	if (canMerge() && !select.exists('.rgh-wait-for-build')) {
		document.body.classList.add('rgh-wait-for-build');

		const container = select('.discussion-timeline-actions');

		// The merge form is regenerated by GitHub on every update
		observeEl(container, showCheckboxIfNecessary);

		// Watch for new commits and their statuses
		prCiStatus.addEventListener(showCheckboxIfNecessary);

		// One of the merge buttons has been clicked
		delegate(container, '.js-merge-commit-button', 'click', handleMergeConfirmation);

		// Cancel wait when the user presses the Cancel button
		delegate(container, '.commit-form-actions button:not(.js-merge-commit-button)', 'click', () => {
			disableForm(false);
		});

		// Warn user if it's not yet submitted.
		// Sadly the message isn't shown
		window.onbeforeunload = () => waiting && 'The PR hasn’t merged yet.';
	}
}
