import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname, isEnterprise} from '../libs/page-detect';
import api from '../libs/api';

export default async () => {
	const container = select('body.page-profile .UnderlineNav-body');

	if (select.exists('.rgh-user-gist') || !container) {
		return;
	}

	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = <a href={href} class="UnderlineNav-item rgh-user-gist" aria-selected="false" role="tab" title="Gists">Gists </a>;
	container.append(link);

	const userData = await api(`users/${username}`);

	link.appendChild(<span class="Counter">{userData.public_gists}</span>);
};
