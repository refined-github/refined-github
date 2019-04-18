/*
The `Projects` tab is hidden from repositories and profiles when there are no projects

New projects can still be created via the [`Create new…` menu](https://user-images.githubusercontent.com/1402241/34909214-18b6fb2e-f8cf-11e7-8556-bed748596d3b.png).
*/

import select from 'select-dom';
// import onetime from 'onetime';
import features from '../libs/features';
import { safeElementReady } from '../libs/dom-utils';
import * as api from '../libs/api';
import { getOwnerAndRepo } from '../libs/utils';

function buildQuery() {
	const { ownerName, repoName } = getOwnerAndRepo();

	return `{
		repository(owner: "${ownerName}", name: "${repoName}") {
			projects(states: [OPEN]){
      			totalCount
    		}
		}
	}`;
}
// const res = await api.v4(buildQuery())
//probably better to quern the actual issue

async function init() {
	// const res = await api.v4(buildQuery())
	// console.log(1,res)
	// await safeElementReady(`
	// 	.orghead + *,
	// 	.repohead + *,
	// 	.user-profile-nav + *
	// `)
	setTimeout(()=>console.log(1110, select.all('.select-menu-no-results').map(x => x.textContent)), 5000)
	console.log(0, select.all('.select-menu-no-results').map(x => x.textContent))

	console.log(0, select.all('.select-menu-title').map(x => x.textContent))

	console.log(0, select("div.filterable-empty[data-filterable-for='project-sidebar-filter-field'][role='menu']"))
	console.log(0, select('.js-project-menu-container'))
	console.log(0, select.all('.select-menu-title').map(x=>x.textContent))

	console.log(0, select.all('.select-menu-filters'))
	console.log(1, select('.select-menu-no-results', select('[aria-label="Select projects"]')))
	console.log(2, select( '[aria-haspopup="menu"]',select('.timeline-comment-header')))
	// select('[aria-label="Select projects"]').remove()
	if (select('.select-menu-no-results', select('[aria-label="Select projects"]')).textContent.trim() === 'No projects'){
			select('.js-discussion-sidebar-item').remove()

	}
	console.log(select('.select-menu-no-results'))
	// select('.js-discussion-sidebar-item').remove()
}

features.add({
	id: 'remove-projects-sidebar',
	include: [
		features.isIssue,
		features.isPR,
	],
	load: features.onAjaxedPages,
	init
});
