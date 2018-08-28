import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';
import fetchGraph from '../libs/graph';
import * as icons from '../libs/icons';

async function onTopRepositoriesSelect(titleNode) {
	const username = getCleanPathname();
	// Get two most starred repos
	const query = `
	{
		search(type: REPOSITORY, query: "user:${username} is:public stars:>0", first: 6) {
			edges {
				node {
					... on Repository {
						descriptionHTML
						primaryLanguage {
							color
							name
						}
						url
						name
						owner {
							login
						}
						stargazers {
							totalCount
						}
						forkCount
						isFork
						parent {
							nameWithOwner
							url
						}
					}
				}
			}
		}
	}
	`;
	const result = await fetchGraph(query);
	const repoList = result.search.edges;
	if (repoList.length === 0) {
		// No repos
		return;
	}
	const reposContainer = select('.pinned-repos-list');
	const originalReposContainer = reposContainer.innerHTML;
	reposContainer.innerHTML = '';

	function repoForkLabel(repo) {
		if (repo.isFork) {
			return <p className={'text-gray text-small mb-2'}>
				Forked from
				<a href={repo.parent.url}>{repo.parent.nameWithOwner}</a>
			</p>;
		}
		return '';
	}

	function repoLanguageColor(repo) {
		if (repo.primaryLanguage) {
			return <span className={'repo-language-color pinned-repo-meta'} style={{backgroundColor: repo.primaryLanguage.color}}/>;
		}
		return '';
	}

	function simplifyNumber(count) {
		const num = Number(count);
		if (num >= 1000) {
			return (Math.floor(num / 100) / 10) + 'k';
		}
		return count;
	}

	for (const repo of repoList) {
		reposContainer.append(
			<li className={`pinned-repo-item p-3 mb-3 border border-gray-dark rounded-1 public ${repo.node.isFork ? 'fork' : 'source'}`}>
				<span className={'pinned-repo-item-content'}>
					<span className={'d-block'}>
						<a href={repo.node.url} className={'text-bold'}>
							<span className={'repo js-repo'}>{repo.node.name}</span>
						</a>
						{repoForkLabel(repo.node)}
					</span>
					<p className={'pinned-repo-desc text-gray text-small d-block mt-2 mb-3'}
						dangerouslySetInnerHTML={{__html: repo.node.descriptionHTML}}/>
					<p className={'mb-0 f6 text-gray'}>
						{repoLanguageColor(repo.node)}
						{repo.node.primaryLanguage ? '  ' + repo.node.primaryLanguage.name + '  ' : ''}
						<a className={'pinned-repo-meta muted-link'}
							href={repo.node.url + '/stargazers'}>{icons.star()} {simplifyNumber(repo.node.stargazers.totalCount)}</a>
					</p>
				</span>
			</li>
		);
	}

	// Switch the title
	titleNode.innerHTML = '';
	titleNode.append(
		<span>
			<span className={'mr-2'}>
				<a href={'#'} onClick={() => onPinnedRepositoriesSelect(titleNode, originalReposContainer)}>
					Pinned repositories
				</a>
			</span>
			/
			<span className={'ml-2'}>
				Top repositories
			</span>
		</span>
	);
}

function onPinnedRepositoriesSelect(showcaseTitle, originalReposContainer) {
	if (originalReposContainer) {
		select('.pinned-repos-list').innerHTML = originalReposContainer;
	}
	showcaseTitle.innerHTML = '';
	showcaseTitle.append(
		<span>
			<span className={'mr-2'}>Pinned repositories</span>
			/
			<span className={'ml-2'}>
				<a href={'#'} onClick={() => onTopRepositoriesSelect(showcaseTitle)}>
					Top repositories
				</a>
			</span>
		</span>
	);
}

export default async function () {
	// Check if the user has no repositories to show
	const noShowcaseArea = select('.js-pinned-repos-reorder-container .blankslate');
	if (noShowcaseArea) {
		return;
	}
	// The "Pinned repositories" title
	const showcaseTitle = select('.js-pinned-repos-reorder-container .text-normal');
	if (!showcaseTitle) {
		return;
	}
	if (!showcaseTitle.textContent.includes('Pinned')) {
		return;
	}
	onPinnedRepositoriesSelect(showcaseTitle);
}
