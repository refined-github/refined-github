import select from 'select-dom';
import {h} from 'dom-chef';
import * as pageDetect from '../libs/page-detect';

// https://github.com/<username>/<repo>/delete/<branch>/<filename>

const repoURL = pageDetect.getRepoURL();

export default function () {
  let fileName
  const fileActions = select.all('.file-actions');
  const deleteFile = fileActions.map(fileAction => fileAction.append(<a href='#' className='delete-file' aria-label='Delete this file from the pull request'>Delete </a>));
  const findBranch = select('.head-ref').innerText;
  const branchName = findBranch.includes(':') ? findBranch.split(':')[1] : findBranch;
  const deleteLinks = select.all('.delete-file')
  const getFileName = (e) => {
    fileName = e.path[2].children[1].childNodes[3].innerText
  }

  deleteLinks.map(deleteLink => deleteLink.addEventListener('click', (e) => getFileName(e)));

  // need to map through deleteLinks and update href for getAll
  //right now this only adds an href to the first delete-file element
  select('.delete-file').href = 'https://github.com/' + repoUrl + '/delete/' + branchName + '/' + fileName;
};
