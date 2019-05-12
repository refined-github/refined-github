import select from 'select-dom';
import features from '../libs/features';
import { getRepoPath, getOwnerAndRepo } from '../libs/utils';

function init(): void | false {
  if (getRepoPath() === 'issues') {
    const {ownerName, repoName} = getOwnerAndRepo();
    select.all<HTMLAnchorElement>(`a[href^="/${ownerName}/${repoName}/issues/"]`).forEach((link) => {
      link.href = `${link.href}#last`;
    })
  } else {
    if (window.location.hash === '#last') {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }
}

features.add({
	id: 'open-issue-to-latest-comment',
	include: [
    features.isIssue,
    features.isIssueList
	],
	load: features.onAjaxedPages,
	init
});