import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {overrideTab} from '../components/extensible-nav-store.js';

function init(): void {
	overrideTab('projects', {label: ''});
	overrideTab('security-and-quality', {label: ''});
	overrideTab('insights', {label: ''});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRepoHeader,
	],
	init,
});

/*

Test URLs:

- Org with 0 projects: https://github.com/babel
- Repo with 0 projects: https://github.com/babel/flavortown
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with some actions not on main branch: https://github.com/quatquatt/no-actions-menu
- Repo with security alerts: (requires a repo you own with Dependabot alerts enabled)

*/
