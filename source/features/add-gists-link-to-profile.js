import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname, isEnterprise, isMobile} from '../libs/page-detect';
import api from '../libs/api';

export default async () => {
	const containerSelector = isMobile() ? '.reponav.js-reponav' : 'body.page-profile .UnderlineNav-body';
	const container = select(containerSelector);

	if (!container) {
		return;
	}
	const linkClass = isMobile() ? 'reponav-item js-selected-navigation-item' : 'UnderlineNav-item';

	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = <a href={href} className={linkClass} role="tab" aria-selected="false">Gists </a>;
	container.append(link);

	const userData = await api(`users/${username}`);
	if (userData.public_gists) {
		link.append(<span className={'Counter'}>{userData.public_gists}</span>);
	}
};
