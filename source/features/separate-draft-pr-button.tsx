import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const previewForm = select('.new-pr-form')! as HTMLFormElement;

	// Move the "Allow edits from maintainers" to its own line if it exists
	const allowEditsCheckbox = select('.float-left', previewForm);
	if (allowEditsCheckbox) {
		allowEditsCheckbox.classList.remove('float-left');
	}

	const buttonBar = select('.flex-justify-end', previewForm)!;
	const defaultButton = select('.BtnGroup', buttonBar)!;

	defaultButton.hidden = true;

	const menuItems = select.all('.select-menu-item', defaultButton);

	for (const menuItem of menuItems) {
		const title = select('.select-menu-item-heading', menuItem)!.textContent!.trim();
		const description = select('.description', menuItem)!.textContent!.trim();
		const radioButton = select('[type=radio]', menuItem)! as HTMLInputElement;

		const classList = ['btn', 'ml-2', 'tooltipped', 'tooltipped-s'];
		if (!title.toLowerCase().includes('draft')) {
			classList.push('btn-primary');
		}

		const submitForm = (): void => {
			radioButton.checked = true;
			previewForm.submit();
		};

		buttonBar.prepend(
			<button
				className={classList.join(' ')}
				aria-label={description}
				type="button"
				onClick={submitForm}
			>
				{title}
			</button>
		);
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
