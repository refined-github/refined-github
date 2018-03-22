import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';
import elementReady from 'element-ready';
import * as icons from '../libs/icons';
import observeEl from '../libs/simplified-element-observer';

const commitTease = '.commit-tease';
const commitTeaseTarget = commitTease + ' .float-right';

function addButton() {
	select(commitTeaseTarget).append(
		<button
			class="btn-octicon p-1 pr-2 rgh-toggle-files"
			aria-label="Toggle files section"
			aria-expanded="true">
			{icons.chevronDown()}
		</button>
	);
	const repoContent = select('.repository-content');
	delegate('.rgh-toggle-files', 'click', ({delegateTarget}) => {
		delegateTarget.setAttribute('aria-expanded', !repoContent.classList.toggle('rgh-files-hidden'));
	});
}

export default function () {
	observeEl(commitTease, async () => {
		await elementReady(commitTeaseTarget);

		if (select.exists(commitTeaseTarget) && !select.exists('.rgh-toggle-files')) {
			addButton();
		}
	});
}
