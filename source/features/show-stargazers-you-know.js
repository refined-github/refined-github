import {h} from 'dom-chef';
import select from 'select-dom';
import domify from '../libs/domify';
import {getRepoURL} from '../libs/page-detect';

const extractUserData = element => {
	const image = element.querySelector('img');
	const imageUrl = new URL(image.src)
	const link = element.querySelector('a').href;
	return {
		avatar: `${imageUrl.origin}${imageUrl.pathname}`,
		description: image.alt,
		link
	};
};

const fetchStargazers = async () => {
	const url = `${location.origin}/${getRepoURL()}/stargazers/you_know`;
	const response = await fetch(url, {credentials: 'same-origin'});
	const dom = domify(await response.text());
	const userCards = [...dom.querySelectorAll('.follow-list-item')];
	const stargazers = userCards.map(extractUserData);
	return stargazers;
};

const avatarHeight = 20;
const renderAvatar = ({link, description, avatar}) => (
	<a href={link} title={description} class="avatar">
		<img
			src={`${avatar}?s=${avatarHeight * window.devicePixelRatio}`}
			alt={description} height={avatarHeight} />
	</a>
);

const getLabel = stargazers =>
	stargazers.length === 1 ?
		`Stargazer you know` :
		`${stargazers.length} Stargazers you know`;

const renderAvatarStackBody = stargazers => {
	const avatars = stargazers.map(renderAvatar);
	return <div
		class="AvatarStack-body tooltipped tooltipped-sw tooltipped-align-right-1"
		aria-label={getLabel(stargazers)}
	>
		{[
			...avatars.slice(0, 2),
			...(avatars.length > 2 ?
				[<div class="avatar-more avatar"></div>, ...avatars.slice(2)] :
				[]
			)
		]}
	</div>;
};

const getAvatarStackModifier = stargazers =>
	stargazers.length >= 3 ? 'AvatarStack-three-plus' :
		stargazers.length === 2 ? 'AvatarStack-two' :
			'';

const renderAvatarStack = stargazers => {
	return <div class={`AvatarStack AvatarStack--right my-1 ${
		getAvatarStackModifier(stargazers)
	}`}>
		{renderAvatarStackBody(stargazers)}
	</div>;
};

export default async () => {
	const stargazers = await fetchStargazers();
	if (stargazers.length > 0) {
		select(`ul.pagehead-actions`).prepend(<li class="d-flex">
			{renderAvatarStack(stargazers)}
		</li>);
	}
};
