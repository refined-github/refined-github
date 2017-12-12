import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const repoUrl = pageDetect.getRepoURL();

export default function () {
	if (select.exists('#projects-feature:checked') && !select.exists('#refined-github-project-new-link')) {
		select('#projects-feature ~ p.note').after(
			<a href={`/${repoUrl}/projects/new`} class="btn btn-sm" id="refined-github-project-new-link">Add a project</a>
		);
	}
}
