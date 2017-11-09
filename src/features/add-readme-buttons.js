import {h} from 'dom-chef';
import select from 'select-dom';
import toSemver from 'to-semver';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

export default function () {
	const readmeContainer = select('.repository-content > #readme');
	if (!readmeContainer) {
		return;
	}

	const buttons = <div id="refined-github-readme-buttons"></div>;

	/**
	 * Generate Release button
	 */
	const tags = select.all('.branch-select-menu [data-tab-filter="tags"] .select-menu-item')
		.map(element => [
			element.getAttribute('data-name'),
			element.getAttribute('href')
		]);
	const releases = new Map(tags);
	const [latestRelease] = toSemver([...releases.keys()], {clean: false});
	if (latestRelease) {
		buttons.appendChild(
			<a
				class="tooltipped tooltipped-nw rgh-tooltipped"
				href={`${releases.get(latestRelease)}#readme`}
				aria-label={`View this file at the latest version (${latestRelease})`}>
				{icons.tag()}
			</a>
		);
	}

	/**
	 * Generate Edit button
	 */
	if (select('.branch-select-menu i').textContent === 'Branch:') {
		const readmeName = select('#readme > h3').textContent.trim();
		const path = select('.breadcrumb').textContent.trim().split('/').slice(1).join('/');
		const currentBranch = select('.branch-select-menu .select-menu-item.selected').textContent.trim();
		buttons.appendChild(
			<a href={`/${repoUrl}/edit/${currentBranch}/${path}${readmeName}`}>
				{icons.edit()}
			</a>
		);
	}

	readmeContainer.appendChild(buttons);
}

