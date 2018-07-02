// might add to line 278

import select from 'select-dom';
import {h} from 'dom-chef';
import {getCleanPathname, getRepoBranch, getRepoPath} from '../libs/page-detect';

export default function () {
  const chevronDown = select('.octicon-chevron-down')
  chevronDown.before(<button type='button'>Delete</button>)
}
