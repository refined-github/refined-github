import React from 'dom-chef';
import {CachedFunction} from 'webext-storage-cache';
import {expectElement, elementExists} from 'select-dom';
import * as pageDetect from 'github-url-detection';
import CodeSquareIcon from 'octicons-plain-react/CodeSquare';

import features from '../feature-manager.js';
import api from '../github-helpers/api.js';
import {getCleanPathname, triggerRepoNavOverflow} from '../github-helpers/index.js';
import createDropdownItem from '../github-helpers/create-dropdown-item.js';
import observe from '../helpers/selector-observer.js';
import GetGistCount from './profile-gists-link.gql';
import {repoUnderlineNavDropdownUl} from '../github-helpers/selectors.js';
import {expectToken} from '../github-helpers/github-token.js';

const gistCount = new CachedFunction('gist-count', {
	async updater(username: string): Promise<number> {
		const {user} = await api.v4(GetGistCount, {
			variables: {username},
		});
		return user.gists.totalCount;
	},
	maxAge: {days: 1},
	staleWhileRevalidate: {days: 3},
});

function getUser(): {url: string; name: string} {
	const name = getCleanPathname();
	const url = pageDetect.isEnterprise()
		? `/gist/${name}`
		: `https://gist.github.com/${name}`;
	return {url, name};
}

async function appendTab(navigationBar: Element): Promise<void> {
	const user = getUser();
	const link = (
		<a
			href={user.url}
			className="UnderlineNav-item js-responsive-underlinenav-item"
			role="tab"
			aria-selected="false"
			data-tab-item="rgh-gists-item"
		>
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm" />
			{' Gists '}
		</a>
	);

	navigationBar.append(link);

	// There are two UnderlineNav items (responsive…) that point to the same dropdown
	const overflowNav = expectElement(repoUnderlineNavDropdownUl);
	if (!elementExists('[data-rgh-label="Gists"]', overflowNav)) {
		overflowNav.append(
			createDropdownItem({
				'label': 'Gists',
				'href': user.url,
				'icon': CodeSquareIcon,
				'data-rgh-label': 'Gists',
			}),
		);
	}

	const count = await gistCount.get(user.name);
	if (count > 0) {
		link.append(<span className="Counter">{count}</span>);
	}

	triggerRepoNavOverflow();
}

async function init(signal: AbortSignal): Promise<void> {
	await expectToken();
	observe('nav[aria-label="User"] > ul', appendTab, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	init,
});

/*

Test URL:

Has gists: https://github.com/fregante
No gists: https://github.com/someone

*/
