import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const previewForm = select('.new-pr-form') as HTMLFormElement;

	// PRs can't be created from some comparison pages:
	// Either base is a tag, not a branch; or there already exists a PR.
	if (!previewForm) {
		return;
	}

	// Move the "Allow edits from maintainers" to its own line if it exists
	const allowEditsCheckbox = select('.float-left', previewForm);
	if (allowEditsCheckbox) {
		allowEditsCheckbox.classList.remove('float-left');
	}

	const buttonBar = select('.flex-justify-end', previewForm)!;
	const createPrButtonGroup = select('.BtnGroup', buttonBar)!;
	const createPrDropdownItems = select.all('.select-menu-item', createPrButtonGroup);

	for (const dropdownItem of createPrDropdownItems) {
		const title = select('.select-menu-item-heading', dropdownItem)!.textContent!.trim();
		const description = select('.description', dropdownItem)!.textContent!.trim();
		const radioButton = select('[type=radio]', dropdownItem)! as HTMLInputElement;
		const classList = ['btn', 'ml-2', 'tooltipped', 'tooltipped-s'];

		if (!/\bdraft\b/i.test(title)) {
			classList.push('btn-primary');
		}

		buttonBar.prepend(
			<button
				className={classList.join(' ')}
				aria-label={description}
				type="submit"
				name={radioButton.name}
				value={radioButton.value}
			>
				{title}
			</button>
		);

		createPrButtonGroup.remove();
	}
}

features.add({
	id: __featureName__,
	description: 'Separates `Create draft pull request` and `Create pull request` buttons.',
	screenshot: 'https://user-images.githubusercontent.com/202916/66609826-4a081980-ebba-11e9-80d8-cdef503a8a80.png',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
