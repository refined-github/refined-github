import {h} from 'dom-chef';
import select from 'select-dom';
import * as cache from '../libs/cache';
import * as api from '../libs/api';
import {getOwnerAndRepo} from '../libs/page-detect';

function buildQuery(owner, repo, numbers) {
	let query = `
	{
		repository(owner: "${owner}", name: "${repo}") {`;

	for (const number of numbers) {
		query += `
			${number}: pullRequest(number: ${number.replace('issue_', '')}) {
				baseRef {
					name
					repository {
						url
						owner {
							login
						}
					}
				}
				headRef {
					name
					repository {
						url
						owner {
							login
						}
					}
				}
			}`;
	}

	query += `
		}
	}`;
	return query;
}

async function fetchFromApi(owner, repo, numbers) {
	const query = buildQuery(owner, repo, numbers);
	const response = await api.v4(query);
	console.log('add-pr-branches 3:', numbers, query, response);

	if (response.data && response.data.repository) {
		const d = {};
		for (const [id, data] of Object.entries(response.data.repository)) {
			d[id] = extractBranches(owner, data);
		}
		return d;
	}
}

function extractBranches(owner, data) {
	console.log('add-pr-branches 5:', data);

	return {
		base: {
			label: data.baseRef.name,
			url: `${data.baseRef.repository.url}/tree/${data.baseRef.name}`
		},
		head: {
			label: (data.headRef.repository.owner.login === owner ? data.headRef.name : `${data.headRef.repository.owner.login}:${data.headRef.name}`),
			url: `${data.headRef.repository.url}/tree/${data.headRef.name}`
		}
	};
}

function getPullBranches(owner, repo, number) {
	return cache.getSet(`pull-branches:${owner}/${repo}`,
		() => fetchFromApi(owner, repo, number)
		, 1
	);
}

export default async function () {
	const {ownerName, repoName} = getOwnerAndRepo();
	const elements = select.all('.issues-listing .js-navigation-container .js-navigation-item');
	const ids = elements.map(pr => pr.id);
	const branches = await getPullBranches(ownerName, repoName, ids);
	console.log('add-pr-branches 1:', ownerName, repoName, elements, ids, branches);

	if (branches) {
		for (const element of elements) {
			const pull = branches[element.id];
			const section = select('.col-9.lh-condensed', element);
			console.log('add-pr-branches 2:', pull, element, section);

			if (pull && section) {
				section.appendChild(
					<div class="mt-1 text-small text-gray">
						Merge
						<span class="commit-ref css-truncate user-select-contain">
							<a title={pull.head.label} href={pull.head.url}>{pull.head.label}</a>
						</span>
						into
						<span class="commit-ref css-truncate user-select-contain">
							<a title={pull.base.label} href={pull.base.url}>{pull.base.label}</a>
						</span>
					</div>
				);
			}
		}
	}
}
