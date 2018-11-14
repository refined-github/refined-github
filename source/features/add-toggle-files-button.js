import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import * as icons from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';

function addButton() {
	const filesHeader = select('.commit-tease');
	if (!filesHeader || select.exists('.rgh-toggle-files')) {
		return;
	}
	filesHeader.append(
		<button
			class="btn-octicon rgh-toggle-files"
			aria-label="Toggle files section"
			aria-expanded="true">
			{icons.chevronDown()}
		</button>
	);
}

export default function () {
	const repoContent = select('.repository-content');
	observeEl(repoContent, addButton);
	delegate('.rgh-toggle-files', 'click', ({delegateTarget}) => {
		delegateTarget.setAttribute('aria-expanded', !repoContent.classList.toggle('rgh-files-hidden'));
	});
}
