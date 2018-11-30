import {h} from 'dom-chef';
import select from 'select-dom';
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
		return response.data.repository;
	}
}

const getLabel = (ref, owner) => (ref.repository.owner.login === owner ? ref.name : `${ref.repository.owner.login}:${ref.name}`);

const createLink = (ref, owner) => (
	<span class="commit-ref css-truncate user-select-contain">
		<a title={getLabel(ref, owner)} href={`${ref.repository.url}/tree/${ref.name}`}>{getLabel(ref, owner)}</a>
	</span>
);

export default async function () {
	const {ownerName, repoName} = getOwnerAndRepo();
	const elements = select.all('.issues-listing .js-navigation-container .js-navigation-item');
	const ids = elements.map(pr => pr.id);
	const branches = await fetchFromApi(ownerName, repoName, ids);
	console.log('add-pr-branches 1:', ownerName, repoName, elements, ids, branches);

	if (branches) {
		for (const element of elements) {
			const pull = branches[element.id];
			const section = select('.col-9.lh-condensed', element);
			console.log('add-pr-branches 2:', pull, element, section);

			if (pull && section) {
				section.appendChild(
					<div class="mt-1 text-small text-gray">Merge {createLink(pull.headRef, ownerName)} into {createLink(pull.baseRef, ownerName)}</div>
				);
			}
		}
	}
}
