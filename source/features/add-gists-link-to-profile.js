import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname, isEnterprise} from '../libs/page-detect';
import * as api from '../libs/api';

export default async () => {
	const container = select('body.page-profile .UnderlineNav-body');

	if (!container) {
		return;
	}

	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;
	const link = <a href={href} class="UnderlineNav-item" role="tab" aria-selected="false">Gists </a>;
	container.append(link);

	const userData = await api.v3(`users/${username}`);
	if (userData.public_gists) {
		link.append(<span class="Counter">{userData.public_gists}</span>);
	}
};
