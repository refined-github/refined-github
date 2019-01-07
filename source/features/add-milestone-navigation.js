import {h} from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getRepoURL} from '../libs/page-detect';

const repoUrl = getRepoURL();

function init() {
	select('.repository-content').before(
		<div class="subnav">
			<div class="subnav-links float-left" role="navigation">
				<a href={`/${repoUrl}/labels`} class="subnav-item">Labels</a>
				<a href={`/${repoUrl}/milestones`} class="subnav-item">Milestones</a>
			</div>
		</div>
	);
}

features.add({
	id: 'add-milestone-navigation',
	dependencies: [
		features.isMilestone
	],
	load: features.onAjaxedPages,
	init
});
