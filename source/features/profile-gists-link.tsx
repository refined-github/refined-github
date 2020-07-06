import './profile-gists-link.css';
import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import CodeSquareIcon from 'octicon/code-square.svg';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {getCleanPathname} from '../github-helpers';

async function init(): Promise<void> {
	await elementReady('.UnderlineNav-body + *');

	const username = getCleanPathname();
	const href = pageDetect.isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	select('.UnderlineNav-body')!.append(
		<a href={href} className="UnderlineNav-item" role="tab" aria-selected="false">
			<CodeSquareIcon className="UnderlineNav-octicon hide-sm"/> Gists
		</a>
	);
}

void features.add({
	id: __filebasename,
	description: 'Adds a link to the user’s public gists on their profile.',
	screenshot: 'https://user-images.githubusercontent.com/11544418/34268306-1c974fd2-e678-11e7-9e82-861dfe7add22.png'
}, {
	include: [
		pageDetect.isUserProfile
	],
	waitForDomReady: false,
	init
});
