import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

export default async function () {
	// Don't duplicate on back/forward in history
	if (select.exists('[data-url$=recently_touched_branches_list]')) {
		return;
	}

	const codeTabURL = select('[data-hotkey="g c"]').href;
	const fragmentURL = `/${repoUrl}/show_partial?partial=tree%2Frecently_touched_branches_list`;

	const response = await fetch(codeTabURL, {
		credentials: 'include'
	});
	const html = await response.text();

	// https://github.com/sindresorhus/refined-github/issues/216
	if (html.includes(fragmentURL)) {
		select('.repository-content').prepend(<include-fragment src={fragmentURL}></include-fragment>);
	}
}

