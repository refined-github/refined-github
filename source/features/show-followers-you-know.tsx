import {React} from 'dom-chef/react';
import select from 'select-dom';
import domify from '../libs/domify';
import features from '../libs/features';
import {getCleanPathname} from '../libs/utils';

const fetchStargazers = async () => {
	const url = `${location.origin}/${getCleanPathname()}/followers/you_know`;
	const response = await fetch(url);
	const dom = domify(await response.text());
	return select.all('.follow-list-item .avatar', dom);
};

const avatarSize = 35;
const renderAvatar = image => {
	const src = new URL(image.src);
	src.searchParams.set('s', String(avatarSize * window.devicePixelRatio));
	image.src = src;
	image.width = avatarSize;
	image.height = avatarSize;

	return (
		<a
			href={image.parentElement.href}
			aria-label={image.alt.substr(1)}
			class="tooltipped tooltipped-n avatar-group-item mr-1"
		>
			{image}
		</a>
	);
};

async function init() {
	const container = select('[itemtype="http://schema.org/Person"]');
	if (!container) {
		return false;
	}

	const stargazers = await fetchStargazers();
	if (stargazers.length === 0) {
		return false;
	}

	container.append(
		<div class="border-top py-3 clearfix">
			<h2 class="mb-1 h4">Followers you know</h2>
			{stargazers.map(renderAvatar)}
		</div>
	);
}

features.add({
	id: 'show-followers-you-know',
	include: [
		features.isUserProfile
	],
	exclude: [
		features.isOwnUserProfile
	],
	load: features.onAjaxedPages,
	init
});
