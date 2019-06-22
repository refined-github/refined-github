import './limit-commit-title-length.css';
import select from 'select-dom';
import features from '../libs/features';
import onPrMergePanelOpen from '../libs/on-pr-merge-panel-open';

function init(): void {
	const inputs = select.all<HTMLInputElement>([
		'#commit-summary-input', // Commit title on edit file page
		'#merge_title_field' // PR merge message field
	].join(','));

	for (const inputField of inputs) {
		const validityCallback = (event: Event): void => {
			if (inputField.value.length > 72) {
				event.preventDefault();
				event.stopImmediatePropagation();

				inputField.setCustomValidity(`The title should be maximum 72 characters, but is ${inputField.value.length}`);

				if (event.type === 'submit') {
					inputField.reportValidity();
				}
			} else {
				inputField.setCustomValidity('');
			}
		};

		inputField.addEventListener('input', validityCallback);
		inputField.form!.addEventListener('submit', validityCallback);
	}

	// For PR merges, GitHub restores any saved commit messages on page load
	// Triggering input event for these fields immediately validates the form
	onPrMergePanelOpen(() => {
		for (const inputField of inputs) {
			inputField.dispatchEvent(new Event('input'));
		}
	});
}

features.add({
	id: 'limit-commit-title-length',
	description: 'Limits the length of commit fields to 72 characters',
	init,
	load: features.onAjaxedPages,
	include: [
		features.isPRConversation,
		features.isEditingFile
	]
});
