import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

function init(): void {
	const previewForm = select('.new-pr-form');

	// PRs can't be created from some comparison pages:
	// Either base is a tag, not a branch; or there already exists a PR.
	if (!previewForm) {
		return;
	}

	const buttonBar = select('.timeline-comment > :last-child', previewForm)!;
	const createPrButtonGroup = select('.BtnGroup', buttonBar)!;
	const createPrDropdownItems = select.all('.select-menu-item', createPrButtonGroup);

	for (const dropdownItem of createPrDropdownItems) {
		let title = select('.select-menu-item-heading', dropdownItem)!.textContent!.trim();
		const description = select('.description', dropdownItem)!.textContent!.trim();
		const radioButton = select<HTMLInputElement>('[type=radio]', dropdownItem)!;
		const classList = ['btn', 'ml-2', 'tooltipped', 'tooltipped-s'];

		if (/\bdraft\b/i.test(title)) {
			title = 'Create draft PR';
		} else {
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
	description: 'Lets you create draft pull requests in one click.',
	screenshot: 'https://user-images.githubusercontent.com/202916/66609826-4a081980-ebba-11e9-80d8-cdef503a8a80.png',
	include: [
		features.isCompare
	],
	load: features.onAjaxedPages,
	init
});
