import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import * as pageDetect from '../libs/page-detect';

export default function () {
	const repoUrl = pageDetect.getRepoURL();
	const readmeContainer = select('.repository-content #readme');

	if (readmeContainer && select('.branch-select-menu i').textContent === 'Branch:') {
		const readmeName = select('#readme .Box-header h3').textContent.trim();
		const path = select('.breadcrumb').textContent.trim().split('/').slice(1).join('/');
		const currentBranch = select('.branch-select-menu .select-menu-item.selected').textContent.trim();
		readmeContainer.append(
			<div id="rgh-readme-buttons">
				<a href={`/${repoUrl}/edit/${currentBranch}/${path}${readmeName}`}>
					{icons.edit()}
				</a>
			</div>
		);
	}
}
