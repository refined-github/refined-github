import {h} from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import {getCleanPathname} from '../libs/page-detect';
import {getUsername} from '../libs/utils';

const extractUserData = element => {
	const image = element.querySelector('img');
	const imageUrl = new URL(image.src);
	const link = element.querySelector('a').href;
	return {
		avatar: `${imageUrl.origin}${imageUrl.pathname}`,
		description: image.alt,
		link
	};
};

const fetchStargazers = async () => {
	const url = `${location.origin}/${getCleanPathname()}/followers/you_know`;
	const response = await fetch(url, {credentials: 'same-origin'});
	const dom = domify(await response.text());
	const userCards = [...dom.querySelectorAll('.follow-list-item')];
	const stargazers = userCards.map(extractUserData);
	return stargazers;
};

const avatarHeight = 35;
const renderAvatar = ({link, description, avatar}) => (
	<a href={link} title={description} class="avatar-group-item mr-1">
		<img
			class="avatar"
			src={`${avatar}?s=${avatarHeight * window.devicePixelRatio}`}
			alt={description} height={avatarHeight} />
	</a>
);

const getHeading = stargazers =>
	stargazers.length === 1 ?
		`Follower you know` :
		`${stargazers.length} Followers you know`;

export default async () => {
	if (getCleanPathname().startsWith(getUsername())) {
		return;
	}
	const stargazers = await fetchStargazers();
	if (stargazers.length === 0) {
		return;
	}
	const container = select('[itemtype="http://schema.org/Person"]');
	if (!container) {
		return;
	}
	container.append(<div class="border-top py-3 clearfix">
		<h2 class="mb-1 h4">{getHeading(stargazers)}</h2>
		{stargazers.map(renderAvatar)}
	</div>);
};
