import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import {overrideTab} from '../components/extensible-nav-store.js';

function init(): void {
	overrideTab('pull-requests', {label: 'Pulls'});
	overrideTab('projects', {demoted: true});
	overrideTab('agents', {demoted: true});
	overrideTab('security-and-quality', {demoted: true});
	overrideTab('insights', {demoted: true});
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
- Repo with some projects: https://github.com/github/docs/projects
- Repo with 0 wiki: https://github.com/babel/babel-sublime-snippets
- Repo with 0 actions: https://github.com/babel/jade-babel
- Repo with some actions not on main branch: https://github.com/quatquatt/no-actions-menu
- Repo with security alerts: (requires a repo you own with Dependabot alerts enabled)

*/
