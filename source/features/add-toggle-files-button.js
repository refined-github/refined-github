import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import * as icons from '../libs/icons';

export default function () {
	select('.commit-tease .float-right').appendChild(<button
		class="btn-octicon p-1 pr-2 js-toggle-files"
		aria-label="Toggle files section"
		aria-expanded="true">
		{icons.arrowUp()}
		{icons.arrowDown()}
	</button>);
	const repoContent = select('.repository-content');
	delegate('.js-toggle-files', 'click', ({currentTarget}) => {
		currentTarget.setAttribute('aria-expanded', !repoContent.classList.toggle('files-hidden'));
	});
}
