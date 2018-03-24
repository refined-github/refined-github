import {h} from 'dom-chef';
import select from 'select-dom';
import {getRepoURL} from '../libs/page-detect';
import fetchApi from '../libs/api';
import {openIssue, closedIssue} from '../libs/icons';

let insertedSidebarItem;

const unsearchableCharactersRegex = /[^\p{Letter}\p{Number}\s]+/gu;
const latinCharactersRegex = /\p{Script=Latin}/u;

export function getSearchableWords(text) {
	return text
		.replace(unsearchableCharactersRegex, ' ') // Only leave letters, numbers and spaces
		.trim()
		.split(/\s+/) // Split words
		.filter(word => {
			// Drop possible "glue" words like articles only in Latin alphabets
			if (latinCharactersRegex.exec(word)) {
				return word.length > 2;
			}

			// Drop 1-digit numbers
			if (/\d/.exec(word)) {
				return word.length > 1;
			}
			return true;
		});
}

async function displayIssueSuggestions(title) {
	const words = getSearchableWords(title);
	if (words.length === 0) {
		return;
	}

	const repo = getRepoURL();
	const apiQuery = encodeURIComponent(`${words.join(' ')} repo:${repo} is:issue`);
	const response = await fetchApi(`search/issues?q=${apiQuery}&per_page=5`).catch(() => null);
	let sidebarItem;

	if (response && response.items && response.items.length > 0) {
		const {items: issues, total_count: totalCount} = response;
		const linkQuery = encodeURIComponent(`${words.join(' ')} is:issue`);

		sidebarItem = (
			<div class="discussion-sidebar-item pt-0">
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
	select('#issue_title').addEventListener('blur', ({target}) => displayIssueSuggestions(target.value));
}
