import './one-click-pr-or-gist.css';
import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function init(): void | false {
	const draftPROption = select('.new-pr-form [name="draft"], #new_gist [name="gist[public]"]');
	if (!draftPROption) {
		// 1. Free accounts can't open Draft PRs in private repos, so this element is missing
		// 2. PRs can't be created from some comparison pages: Either base is a tag, not a branch; or there already exists a PR.
		return false;
	}

	const initialGroupedButtons = draftPROption.closest('.BtnGroup')!;

	for (const dropdownItem of select.all('.select-menu-item', initialGroupedButtons)) {
		let title = select('.select-menu-item-heading', dropdownItem)!.textContent!.trim();
		const description = select('.description', dropdownItem)!.textContent!.trim();
		const radioButton = select('input[type=radio]', dropdownItem)!;
		const classList = ['btn', 'ml-2', 'tooltipped', 'tooltipped-s'];

		if (/\bdraft\b/i.test(title)) {
			title = 'Create draft PR';
		} else {
			classList.push('btn-primary');
		}

		initialGroupedButtons.after(
			<button
				className={classList.join(' ')}
				aria-label={description}
				type="submit"
				name={radioButton.name}
				value={radioButton.value}
			>
				{title}
			</button>,
		);
	}

	initialGroupedButtons.remove();
}

void features.add(__filebasename, {
	include: [
		pageDetect.isCompare,
		pageDetect.isGist,
	],
	init,
});
