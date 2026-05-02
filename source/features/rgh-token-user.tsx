import AlertIcon from 'octicons-plain-react/Alert';
import React from 'react';

import features from '../feature-manager.js';
import {api3} from '../github-helpers/api.js';
import {tokenUser} from '../github-helpers/github-token.js';
import {getLoggedInUser} from '../github-helpers/index.js';
import onetime from '../helpers/onetime.js';
import {OptionsLink} from '../helpers/open-options.js';
import observe from '../helpers/selector-observer.js';
import {getToken} from '../options-storage.js';

async function verify(header: HTMLElement): Promise<void> {
	const token = await getToken();
	if (!token) {
		return;
	}

	const currentWebUser = getLoggedInUser();
	const currentTokenUser = await tokenUser.get(api3, token);
	if (currentWebUser !== currentTokenUser) {
		header.after(
			// Use raw "flash" classes to blend in better with the dropdown menu
			<div className="flash flash-error px-3 mt-3 mb-0 py-2 d-flex flex-items-center border-0 rounded-0">
				<AlertIcon className="mr-2" />
				<span>
					Write API calls are blocked because your <OptionsLink className="btn-link">Refined GitHub token</OptionsLink>{' '}
					belongs to <code>{currentTokenUser}</code>, not <code>{currentWebUser}</code>.
				</span>
			</div>,
		);
	}
}

function initOnce(): void {
	observe('div[aria-labelledby="global-nav-user-menu-header"] > div[role="heading"]', verify);
}

void features.add(import.meta.url, {
	init: onetime(initOnce),
});

/*

Test URL: anywhere

*/
