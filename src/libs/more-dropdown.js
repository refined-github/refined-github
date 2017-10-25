import select from 'select-dom';
import {h} from 'dom-chef';
import * as icons from './icons';
import * as pageDetect from './page-detect';

const repoUrl = pageDetect.getRepoURL();

export default function () {
	if (select.exists('.refined-github-more')) {
		return;
	}

	const moreDropdown = (
		<div class="reponav-dropdown js-menu-container refined-github-more">
			<button type="button" class="btn-link reponav-item reponav-dropdown js-menu-target " data-no-toggle aria-expanded="false" aria-haspopup="true">More {icons.triangleDown()}</button>
			<div class="dropdown-menu-content js-menu-content">
				<div class="dropdown-menu dropdown-menu-sw">
					<a href={`/${repoUrl}/compare`} class="dropdown-item" data-skip-pjax>
						{icons.darkCompare()}
						<span itemprop="name"> Compare</span>
					</a>
					{
						pageDetect.isEnterprise() ? '' :
						<a href={`/${repoUrl}/network/dependencies`} class="dropdown-item rgh-dependency-graph" data-skip-pjax>
							{icons.dependency()}
							<span itemprop="name"> Dependencies</span>
						</a>
					}
					<a href={`/${repoUrl}/pulse`} class="dropdown-item" data-skip-pjax>
						{icons.graph()}
						<span itemprop="name"> Insights</span>
					</a>
				</div>
			</div>
		</div>
	);

	const insightsTab = select('[data-selected-links~="pulse"]');
	if (insightsTab) {
		insightsTab.remove();
	}

	const settingsTab = select('[data-selected-links~="repo_settings"]');
	if (settingsTab) {
		settingsTab.before(moreDropdown);
		return;
	}
	const repoNav = select('.reponav');
	if (repoNav) {
		repoNav.append(moreDropdown);
	}
}
