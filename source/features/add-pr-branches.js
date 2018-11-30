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
					id
				}
				baseRefName

				headRef {
					id
				}
				headRefName
				headRepository {
					url
				}
				headRepositoryOwner {
					login
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
		const pulls = {};
		for (const [id, data] of Object.entries(response.data.repository)) {
			console.log('add-pr-branches 5:', owner, repo, id, data);
			pulls[id] = normalizePullInfo(owner, repo, data);
		}
		return pulls;
	}
}

const normalizePullInfo = (owner, repo, data) => {
	console.log('add-pr-branches 6:', owner, repo, data);

	return {
		base: {
			label: data.baseRefName,
			url: `https://github.com/${owner}/${repo}/tree/${data.baseRefName}`,
			active: Boolean(data.baseRef)
		},
		head: {
			label: (data.headRepositoryOwner && data.headRepositoryOwner.login === owner ?
				data.headRefName :
				`${data.headRepositoryOwner.login}:${data.headRefName}`),
			url: (data.headRepository ?
				`${data.headRepository.url}/tree/${data.headRefName}` :
				null),
			active: Boolean(data.headRef)
		}
	};
};

const createLink = ref => {
	return (
		<span class="commit-ref css-truncate user-select-contain" style={(ref.active ? {} : {'text-decoration': 'line-through'})}>
			{ref.url ?
				<a title={(ref.active ? ref.label : 'Deleted')} href={ref.url}>{ref.label}</a> :
				<span class="unknown-repo">unknown repository</span>}
		</span>
	);
};

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
					<div class="mt-1 text-small text-gray">Merge {createLink(pull.head)} into {createLink(pull.base)}</div>
				);
			}
		}
	}
}
