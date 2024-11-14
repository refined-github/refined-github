import React from 'react';
import AlertIcon from 'octicons-plain-react/Alert';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';
import {getUsername} from '../github-helpers/index.js';
import {getToken} from '../options-storage.js';
import {tokenUser} from '../github-helpers/github-token.js';
import {api3} from '../github-helpers/api.js';
import createBanner from '../github-helpers/banner.js';
import onetime from '../helpers/onetime.js';
import {OptionsLink} from '../helpers/open-options.js';

async function verify(header: HTMLButtonElement): Promise<void> {
	const token = await getToken();
	if (!token) {
		return;
	}

	const currentWebUser = getUsername();
	const currentTokenUser = await tokenUser.get(api3, token);
	if (currentWebUser !== currentTokenUser) {
		header.after(createBanner({
			icon: <AlertIcon />,
			classes: ['mx-3', 'mt-3', 'mb-0', 'py-2'],
			text: [
				<>Your <OptionsLink className="btn-link">Refined GitHub token</OptionsLink> is for a different user, the extension will act on behalf of <code>{currentTokenUser}</code></>,
			],
		},
		));
	}
}

function init(): void {
	observe('[aria-label="User navigation"][role="heading"]', verify);
}

void features.add(import.meta.url, {
	init: onetime(init),
});

/*

Test URL: anywhere

*/
