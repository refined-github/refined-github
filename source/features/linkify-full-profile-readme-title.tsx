import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

async function init(): Promise<void> {
	const title = select(".user-profile-nav + div .octicon-smiley + a");
	if (title) {
		const {childNodes: titleNodes} = title;

		const owner = location.pathname.slice(1);
		const {innerText: repository} = titleNodes[3] as HTMLAnchorElement;

		titleNodes[5].replaceWith(<a href={`/${owner}/${repository}#readme`} className="no-underline link-gray-dark readme-text">README</a>);
		select('.readme-text')!.append(
			titleNodes[6]
		);
	}
}

void features.add(
	{
		id: __filebasename,
		description: 'Linkify the readme text on profile pages.',
		screenshot: 'https://user-images.githubusercontent.com/29491356/89711998-094b7d80-d9e2-11ea-8ae8-2957960d2308.png'
	},
	{
		include: [
			pageDetect.isUserProfile
		],
		repeatOnAjax: false,
		init
	}
);
