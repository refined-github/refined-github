import {h} from 'dom-chef';
import select from 'select-dom';
import {getRepoURL} from '../libs/page-detect';
import fetchApi from '../libs/api';
import {openIssue, closedIssue} from '../libs/icons';

let insertedSidebarItem;

const escapeQualifiers = str => str.replace(/[a-z-]+:[a-z-]+/g, '"$1"');

async function displayIssueSuggestions(title) {
	if (title === '') {
		return;
	}

	const repo = getRepoURL();
	const apiQuery = encodeURIComponent(`${escapeQualifiers(title)} repo:${repo} is:issue`);
	const response = await fetchApi(`search/issues?q=${apiQuery}&per_page=5`).catch(() => null);
	let sidebarItem;

	if (response && response.items && response.items.length > 0) {
		const {items: issues, total_count: totalCount} = response;
		const linkQuery = encodeURIComponent(`${escapeQualifiers(title)} is:issue`);

		sidebarItem = (
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
				{
					issues.length < totalCount && (
						<p class="note mt-2">
							There are <a href={`/${repo}/issues?q=${linkQuery}`}>{totalCount - issues.length} more results</a>.
						</p>
					)
				}
			</div>
		);
	}

	if (insertedSidebarItem) {
		insertedSidebarItem.remove();
	}
	if (sidebarItem) {
		select('.discussion-sidebar').prepend(sidebarItem);
		insertedSidebarItem = sidebarItem;
	}
}

export default function () {
	console.log(select('#issue_title'));
	select('#issue_title').addEventListener('blur', ({target}) => displayIssueSuggestions(target.value));
}
