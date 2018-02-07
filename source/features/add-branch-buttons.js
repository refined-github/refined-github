import {h} from 'dom-chef';
import select from 'select-dom';
import toSemver from 'to-semver';
import * as icons from '../libs/icons';
import {groupButtons} from '../libs/utils';

export default function () {
	const branchSelector = select('.branch-select-menu .select-menu-button');
	if (!branchSelector || select.exists('.rgh-release-link')) {
		return;
	}
	const tags = select.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item')
		.map(element => [
			element.getAttribute('data-name'),
			element.getAttribute('href')
		]);
	const releases = new Map(tags);
	const [latestRelease] = toSemver([...releases.keys()], {clean: false});
	if (latestRelease) {
		const link = (
			<a
				class="btn btn-sm tooltipped tooltipped-ne rgh-release-link"
				href={`${releases.get(latestRelease)}`}
				aria-label={`Visit the latest release (${latestRelease})`}>
				{icons.tag()}
			</a>
		);
		branchSelector.after(link);
		groupButtons([branchSelector, link]);
	}
}
