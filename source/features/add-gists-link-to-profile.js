import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';
import api from '../libs/api';

export default async () => {
	const username = getCleanPathname();
	const { public_gists: publicGists } = await api(`users/${username}`)

	select('.UnderlineNav-body').append(
		<a href={`https://gist.github.com/${username}`} class="UnderlineNav-item" role="tab" title="Gists">
			{'Gists '}
			<span class="Counter">{publicGists}</span>
		</a>
	);
};
