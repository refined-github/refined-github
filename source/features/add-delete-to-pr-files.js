// might add to line 278

import select from 'select-dom';
import {h} from 'dom-chef';
import * as pageDetect from '../libs/page-detect';

export default function () {
  const fileActions = select('.file-actions')
  const deleteFile = fileActions.append(<a href='#' className='delete-file' aria-label='Delete this file from the pull request'>Delete </a>)
  getBranchName()
}
