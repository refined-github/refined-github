import './one-click-pr-or-gist.css';
import React from 'dom-chef';
import {$, $$, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import selectHas from '../helpers/select-has.js';

function init(): void | false {
	const initialGroupedButtons = selectHas('.BtnGroup:has([name="draft"], [name="gist[public]"])');
	if (!initialGroupedButtons) {
		// 1. Free accounts can't open Draft PRs in private repos, so this element is missing
		// 2. PRs can't be created from some comparison pages: Either base is a tag, not a branch; or there already exists a PR.
		return false;
	}

	for (const dropdownItem of $$('.select-menu-item', initialGroupedButtons)) {
		let title = $('.select-menu-item-heading', dropdownItem)!.textContent.trim();
		const description = $('.description', dropdownItem)!.textContent.trim();
		const radioButton = $('input[type=radio]', dropdownItem)!;
		const classList = ['btn', 'ml-2', 'tooltipped', 'tooltipped-s'];

		if (/\bdraft\b/i.test(title)) {
			title = 'Create draft PR';
		} else {
			classList.push('btn-primary');
		}

		initialGroupedButtons.after(
			<button
				data-disable-invalid
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

void features.add(import.meta.url, {
	include: [
		pageDetect.isCompare,
		pageDetect.isGist,
	],
	exclude: [
		() => elementExists('[data-show-dialog-id="drafts-upgrade-dialog"]'),
	],
	deduplicate: 'has-rgh',
	awaitDomReady: true,
	init,
});
