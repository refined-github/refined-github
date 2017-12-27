import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname, isEnterprise} from '../libs/page-detect';
import api from '../libs/api';

export default async () => {
	if (select.exists('.rgh-user-gist')) {
		return;
	}

	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = <a href={href} class="rgh-user-gist" role="tab">Gists </a>;
	const container = select('.orgnav, .UnderlineNav-body');
	if (container.classList.contains('orgnav')) {
		link.classList.add('pagehead-tabs-item');
	} else {
		link.classList.add('UnderlineNav-item');
	}
	container.append(link);

	const userData = await api(`users/${username}`);

	link.appendChild(<span class="Counter">{userData.public_gists}</span>);
};
