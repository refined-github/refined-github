import select from 'select-dom';
import {h} from 'dom-chef';
import * as pageDetect from './page-detect';
import * as icons from './icons';

async function handleBrowseAtIssueTime(e) {
	const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
	const browseUrl = new URL(`https://api.github.com/repos/${ownerName}/${repoName}/commits`);
	browseUrl.searchParams.set('sha', 'master');
	browseUrl.searchParams.set('until', e.target.getAttribute('browse-at'));
	browseUrl.searchParams.set('per_page', '1');
	const response = await fetch(browseUrl).then(r => r.json());
	const hash = response[0].commit.url.substring(response[0].commit.url.lastIndexOf('/') + 1);
	window.open(`https://github.com/${ownerName}/${repoName}/tree/${hash}`, '_blank');
}

export default function () {
	const commentHeaders = select.all('.timeline-comment-header');
	for (const commentHeader of commentHeaders) {
		const timestamp = select('relative-time', commentHeader).getAttribute('datetime');
		select('.timeline-comment-actions', commentHeader).insertAdjacentElement('beforeend',
			<button type="button" onClick={handleBrowseAtIssueTime} browse-at={timestamp} style={{float: 'left'}} class="btn btn-link timeline-comment-action">
				<span style={{'pointer-events': 'none'}}>{icons.code()}</span>
			</button>
		);
	}
}
