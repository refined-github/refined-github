import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import delegate, {DelegateEvent} from 'delegate-it';
import * as api from '../libs/api';
import features from '../libs/features';


async function handleMenuOpening(event: DelegateEvent): Promise<void> {
	const dropdown = event.delegateTarget.nextElementSibling!;

	const editFile = select<HTMLAnchorElement>('[aria-label^="Change this"]', dropdown);
	if (!editFile || select.exists('[href*="rgh-revert-to="]', dropdown)) {
		return;
	}

	const url = new URL(editFile.href);
	url.searchParams.set('rgh-revert-to', select('.base-ref')!.title);

	editFile.after(
		<a
			href={String(url)}
			className="pl-5 dropdown-item btn-link"
			role="menuitem">
			Revert file
		</a>
	);
}

async function injectRevertedCode(): Promise<void> {
	const input = await elementReady('.js-code-textarea');
	input.value = await api.v3()
}

function init(): void {
	delegate('.js-file-header-dropdown > summary', 'click', handleMenuOpening);
}

features.add({
	id: __featureName__,
	description: 'Revert all the changes to a file in a PR',
	include: [
		features.isPRFiles
	],
	load: features.onAjaxedPages,
	init
});
}

features.add({
	id: __featureName__,
	description: '',
	include: [
		(): boolean => new URLSearchParams(location.search).has('rgh-revert-to')
	],
	init: injectRevertedCode
});
