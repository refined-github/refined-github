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

	// Count the stars
	let starCount = 0;
	let page = 1;
	for (;;) {
		// eslint-disable-next-line no-await-in-loop
		const repoList = await fetchApi(`users/${username}/repos?type=owner&page=${page}&per_page=100`).catch(() => null);
		console.log(repoList);
		if (!repoList || repoList.length === 0) {
			break;
		}
		for (const repoObj of repoList) {
			if (Object.prototype.hasOwnProperty.call(repoObj, 'stargazers_count')) {
				starCount += repoObj.stargazers_count;
			}
		}
		page++;
	}

	if (starCount >= 1000) {
		// Simplify
		starCount = (Math.round(starCount / 100) / 10) + 'k';
	}

	detailsContainer.append(
		<li itemprop={'starCount'} itemProple={'false'} aria-label={'Star Count'}
			className={'vcard-detail pt-1 css-truncate css-truncate-target'}>
			{icons.star()}
			<span className={'p-label'}>Stars Received: {starCount}</span>
		</li>
	);
};
