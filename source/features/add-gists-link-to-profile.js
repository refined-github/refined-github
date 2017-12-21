import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname} from '../libs/page-detect';

export default () => {
	const username = getCleanPathname();

	select('.UnderlineNav-body').append(
		<a href={`https://gist.github.com/${username}`} class="UnderlineNav-item" role="tab" title="Gists">
			Gists
		</a>
	);
};
