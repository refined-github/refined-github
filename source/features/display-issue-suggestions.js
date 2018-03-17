import {h} from 'dom-chef';
import select from 'select-dom';
import {getRepoURL} from '../libs/page-detect';
import fetchApi from '../libs/api';
import {openIssue, closedIssue} from '../libs/icons';

let insertedSidebarItem;

async function displayIssueSuggestions(title = 'issue comment') {
	const repo = getRepoURL();
	const query = encodeURIComponent(`${title.replace(/:/g, '\\:')} repo:${repo} type:issue`);
	const url = `search/issues?q=${query}`;
	const issues = (await fetchApi(url)).items;
	const sidebar = select('.discussion-sidebar');

	const sidebarItem = (
		<div class="discussion-sidebar-item">
			<div class="text-bold mb-2">Possibly related issues</div>
			<div class="Box Box--condensed">
				{
					issues.map(issue => (
						<a class="Box-row d-flex px-2" href={issue.html_url}>
							<div class="flex-shrink">{issue.state === 'open' ? openIssue() : closedIssue()}</div>
							<div class="flex-grow pl-2">{issue.title}</div>
						</a>
					))
				}
			</div>
		</div>
	);

	if (insertedSidebarItem) {
		insertedSidebarItem.replaceWith(sidebarItem);
	} else {
		sidebar.prepend(sidebarItem);
	}
	insertedSidebarItem = sidebarItem;
}

export default function () {
	console.log(select('#issue_title'));
	select('#issue_title').addEventListener('blur', ({target}) => displayIssueSuggestions(target.value));
}
