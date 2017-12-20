import select from 'select-dom';
import {h} from 'dom-chef';

export default async () => {
	const username = document.head.querySelector('meta[property="profile:username"]').attributes.content.value;

	const gistsTab = (
		<a href={`//gist.github.com/${username}`} class="UnderlineNav-item" role="tab" title="Gists">
			Gists
		</a>
	);

	select('.UnderlineNav-body').appendChild(gistsTab);
};
