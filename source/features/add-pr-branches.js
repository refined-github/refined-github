import {h} from 'dom-chef';
import select from 'select-dom';
import * as cache from '../libs/cache';
import * as api from '../libs/api';
import {getOwnerAndRepo} from '../libs/page-detect';

async function fetchFromApi(owner, repo, number) {
	const response = await api.v4(`
{
  repository(owner: "${owner}", name: "${repo}") {
    pullRequest(number: ${number}) {
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
    }
  }
}`);
	if (response.data) {
		const pr = response.data.repository.pullRequest;
		return {
			base: {
				label: pr.baseRef.name,
				url: `${pr.baseRef.repository.url}/tree/${pr.baseRef.name}`
			},
			head: {
				label: (pr.headRef.repository.owner.login === owner ? pr.headRef.name : `${pr.headRef.repository.owner.login}:${pr.headRef.name}`),
				url: `${pr.headRef.repository.url}/tree/${pr.headRef.name}`
			}
		};
	}
}

function getPullBranches(owner, repo, number) {
	return cache.getSet(`pull-branches:${owner}/${repo}/pull/${number}`,
		() => fetchFromApi(owner, repo, number)
		, 1
	);
}

export default async function () {
	const {ownerName, repoName} = getOwnerAndRepo();

	const prs = select.all('.issues-listing .js-navigation-container .js-navigation-item');
	for (const pr of prs) {
		const number = pr.id.replace('issue_', '');
		const pull = await getPullBranches(ownerName, repoName, number);
		const section = select('.col-9.lh-condensed', pr);
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
