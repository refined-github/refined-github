import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import fetchDom from '../helpers/fetch-dom';
import {getCleanPathname} from '../github-helpers';

const fetchStargazers = async (): Promise<HTMLImageElement[]> => {
	const url = `/${getCleanPathname()}/followers/you_know`;
	const dom = await fetchDom(url);
	return select.all<HTMLImageElement>('.follow-list-item .avatar', dom);
};

const avatarSize = 35;
function renderAvatar(image: HTMLImageElement): HTMLElement {
	const imageUrl = new URL(image.src);
	imageUrl.searchParams.set('s', String(avatarSize * window.devicePixelRatio));
	image.src = String(imageUrl);
	image.width = avatarSize;
	image.height = avatarSize;

	return (
		<a
			href={(image.parentElement as HTMLAnchorElement).href}
			aria-label={image.alt.slice(1)}
			className="tooltipped tooltipped-n avatar-group-item mr-1"
		>
			{image}
		</a>
	);
}

async function init(): Promise<false | void> {
	const container = select('[itemtype="http://schema.org/Person"]');
	if (!container) {
		return false;
	}

	const stargazers = await fetchStargazers();
	if (stargazers.length === 0) {
		return false;
	}

	container.append(
		<div className="border-top pt-3 mt-3 clearfix hide-sm hide-md">
			<h2 className="mb-2 h4">Followers you know</h2>
			{stargazers.map(renderAvatar)}
		</div>
	);
}

void features.add({
	id: __filebasename,
	disabled: '#3345',
	description: 'Followers you know are shown on profile pages.',
	screenshot: 'https://user-images.githubusercontent.com/2906365/42009293-b1503f62-7a57-11e8-88f5-9c2fb3651a14.png',
	testOn: ''
}, {
	include: [
		pageDetect.isUserProfile
	],
	exclude: [
		pageDetect.isOwnUserProfile
	],
	init
});
