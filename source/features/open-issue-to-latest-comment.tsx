import select from 'select-dom';
import features from '../libs/features';
import { getRepoPath, getOwnerAndRepo } from '../libs/utils';

function init(): void | false {
  if (getRepoPath() === 'issues') {
    const {ownerName, repoName} = getOwnerAndRepo();
    select.all<HTMLAnchorElement>(`.js-issue-row a.muted-link[href^="/${ownerName}/${repoName}/issues/"]`).forEach((link) => {
      link.href = `${link.href}#last`;
    })
  } else {
    if (window.location.hash === '#last') {
      setTimeout(() => {
        const comments = select.all('.js-comment-container')
        if (comments.length > 0) {
          comments[comments.length - 1].scrollIntoView();
        }
      }, 100);
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