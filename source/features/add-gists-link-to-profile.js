import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname, isEnterprise} from '../libs/page-detect';
import api from '../libs/api';

export default async () => {
	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;

	select('.UnderlineNav-body').append(
		<a href={href} class="UnderlineNav-item usernav-gists" role="tab" title="Gists">
			{'Gists '}
		</a>
	);

	const {public_gists: publicGists} = await api(`users/${username}`);

	select('.usernav-gists').appendChild(
		<span class="Counter">{publicGists}</span>
	)
};
