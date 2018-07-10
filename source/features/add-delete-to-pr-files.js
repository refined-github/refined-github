import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';
import {getRepoURL} from '../libs/page-detect';

export default function () {
	const repoURL = getRepoURL();
	const branchName = select('.head-ref').textContent.split(':').pop();

	for (const file of select.all('.file-header')) {
		const fileName = select('.file-info a', file).title;
		const url = `/${repoURL}/delete/${branchName}/${fileName}`;
		select('.octicon-pencil', file).parentElement.after(
			<a href={url} className="btn-octicon btn-octicon-danger">
				{icons.trashcan()}
			</a>
		);
	}
}
