import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void | false {
	const previewForm = select('.new-pr-form');

	// PRs can't be created from some comparison pages:
	// Either base is a tag, not a branch; or there already exists a PR.
	if (!previewForm) {
		return false;
	}

	const createPrButtonGroup = select(['.hx_create-pr-button', '.timeline-comment > :last-child > .BtnGroup']);
	if (!createPrButtonGroup) {
		// Free accounts can't open Draft PRs in private repos, so this element is missing
		return false;
	}

	const createPrDropdownItems = select.all('.select-menu-item', previewForm);

	for (const dropdownItem of createPrDropdownItems) {
		let title = select('.select-menu-item-heading', dropdownItem)!.textContent!.trim();
		const description = select('.description', dropdownItem)!.textContent!.trim();
		const radioButton = select('input[type=radio]', dropdownItem)!;
		const classList = ['btn', 'ml-2', 'tooltipped', 'tooltipped-s'];

		if (/\bdraft\b/i.test(title)) {
			title = 'Create draft PR';
		} else {
			classList.push('btn-primary');
		}

		createPrButtonGroup.after(
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
	}

	select('details', createPrButtonGroup.parentElement!)!.remove();
	createPrButtonGroup.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCompare
	],
	init
});
