import {$} from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {getRepo} from '../github-helpers/index.js';

function init(): void {
	const {owner} = getRepo()!;
	const settingsLinkElement = $(`[href$="/organizations/${owner}/settings/interaction_limits"]`);
	settingsLinkElement!.parentElement!.parentElement!.parentElement!.parentElement!.remove();
}

void features.add(import.meta.url, {
	include: [pageDetect.isOrganizationRepo, pageDetect.isRepoHome],
	awaitDomReady: true,
	init,
});

/*

Test URLs:

Any organization repository homepage https://github.com/refined-github/refined-github

Only visible to organization maintainers
Need the feature to be enabled on organization level https://github.com/organizations/refined-github/settings/interaction_limits

*/
