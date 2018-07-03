import select from 'select-dom';
import {h} from 'dom-chef';
import * as pageDetect from '../libs/page-detect';

const repoURL = pageDetect.getRepoURL();

export default function () {
  const fileActions = select.all('.file-actions');
  console.log(fileActions)
  const deleteFile = fileActions.map(fileAction => fileAction.append(<a href='#' className='delete-file' aria-label='Delete this file from the pull request'>Delete </a>));
  const findBranch = select('.head-ref').innerText;
  const branchName = findBranch.includes(':') ? findBranch.split(':')[1] : findBranch;
  // select('.delete-file').href = 'https://github.com/' + repoUrl + '/delete/' + branchName + fileName
};
