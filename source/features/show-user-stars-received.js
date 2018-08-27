import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import fetchApi from '../libs/api';
import {getCleanPathname} from '../libs/page-detect';

export default async () => {
	// Get all repositories
	const username = getCleanPathname();

	// Check if this is in fact a user (not an org)
	const userContainer = select('[itemtype="http://schema.org/Person"]');
	if (!userContainer) {
		return;
	}
	const detailsContainer = select('.vcard-details', userContainer);
	if (!detailsContainer) {
		return;
	}

	// Get the amount of public repositories for the user
	const userInfo = await fetchApi(`users/${username}`);
	if (!userInfo || !Reflect.has(userInfo, 'public_repos')) {
		return;
	}
	const reposPerPage = 100;
	const totalRepoCount = userInfo.public_repos;
	const totalPageCount = Math.ceil(totalRepoCount / reposPerPage) + (totalRepoCount % reposPerPage === 0 ? 0 : 1);
	console.log(totalRepoCount);

	// Count the stars
	let starCount = 0;
	const promises = [];
	for (let page = 0; page < totalPageCount; page++) {
		promises.push(fetchApi(`users/${username}/repos?type=owner&page=${page}&per_page=${reposPerPage}`));
	}
	const results = await Promise.all(promises);
	for (const repoList of results) {
		if (!repoList || repoList.length === 0) {
			continue;
		}
		for (const repoObj of repoList) {
			if (Reflect.has(repoObj, 'stargazers_count')) {
				starCount += repoObj.stargazers_count;
			}
		}
	}

	if (starCount >= 1000) {
		// Simplify
		starCount = (Math.round(starCount / 100) / 10) + 'k';
	}

	detailsContainer.append(
		<li itemprop={'starCount'} itemProple={'false'} aria-label={'Star Count'}
			className={'vcard-detail pt-1 css-truncate css-truncate-target'}>
			{icons.star()}
			<span className={'p-label'}>{starCount} stars received</span>
		</li>
	);
};
