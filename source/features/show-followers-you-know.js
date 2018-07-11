import {h} from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import {getCleanPathname} from '../libs/page-detect';
import {getUsername} from '../libs/utils';

const fetchStargazers = async () => {
	const url = `${location.origin}/${getCleanPathname()}/followers/you_know`;
	const response = await fetch(url, {credentials: 'same-origin'});
	const dom = domify(await response.text());
	return select.all('.follow-list-item .avatar', dom);
};

const avatarSize = 35;
const renderAvatar = image => {
	const src = new URL(image.src);
	src.searchParams.set('s', avatarSize * window.devicePixelRatio);
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

const getHeading = stargazers =>
	stargazers.length === 1 ?
		`Follower you know` :
		`${stargazers.length} Followers you know`;

export default async () => {
	if (getCleanPathname().startsWith(getUsername())) {
		return;
	}
	const container = select('[itemtype="http://schema.org/Person"]');
	if (!container) {
		return;
	}
	const stargazers = await fetchStargazers();
	if (stargazers.length === 0) {
		return;
	}
	container.append(
		<div class="border-top py-3 clearfix">
			<h2 class="mb-1 h4">{getHeading(stargazers)}</h2>
			{stargazers.map(renderAvatar)}
		</div>
	);
};
