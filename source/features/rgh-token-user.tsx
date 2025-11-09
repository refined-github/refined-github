import React from 'react';
import AlertIcon from 'octicons-plain-react/Alert';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getLoggedInUser} from '../github-helpers/index.js';
import {getToken} from '../options-storage.js';
import {tokenUser} from '../github-helpers/github-token.js';
import {api3} from '../github-helpers/api.js';
import onetime from '../helpers/onetime.js';
import {OptionsLink} from '../helpers/open-options.js';

async function verify(header: HTMLButtonElement): Promise<void> {
	const token = await getToken();
	if (!token) {
		return;
	}

	const currentWebUser = getLoggedInUser();
	const currentTokenUser = await tokenUser.get(api3, token);
	if (currentWebUser !== currentTokenUser) {
		header.after(
			// Use raw "flash" classes to blend in better with the dropdown menu
			<div className="flash px-3 mt-3 mb-0 py-2 d-flex flex-items-center border-0 rounded-0">
				<AlertIcon className="mr-2" />
				<span>Your <OptionsLink className="btn-link">Refined GitHub token</OptionsLink> is for a different user, the extension will act on behalf of <code>{currentTokenUser}</code></span>
			</div>,
		);
	}
}

function initOnce(): void {
	observe('[aria-label="User navigation"][role="heading"]', verify);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*

Test URL: anywhere

*/
