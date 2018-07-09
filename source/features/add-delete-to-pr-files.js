import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const repoURL = pageDetect.getRepoURL();

export default function () {
	const branchName = select('.head-ref').textContent.split(':').pop();

	const filesInfo = select.all('.file-info');
	const generateURL = filesInfo.map(file => `/${repoURL}/delete/${branchName}/${file.children[1].title}`);

	const fileActionContainers = select.all('div.BtnGroup').slice(1);
	fileActionContainers.forEach((container, index) => {
		container.prepend(<a
			href={generateURL[index]}
			className="btn btn-sm tooltipped tooltipped-s BtnGroup-item"
			aria-label="Delete this file from the pull request">Delete</a>);
	});
}
