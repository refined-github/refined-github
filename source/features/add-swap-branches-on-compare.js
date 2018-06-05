import {h} from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/utils';

import * as pageDetect from '../libs/page-detect';

export default async () => {
	const compareIcon = select('.octicon-git-compare');

	const compareURL = pageDetect.getRepoPath().replace('compare/', '').split('...');

	// Compares against the "base" branch only have one in the URL
	const currentBase = compareURL.length > 1 ? compareURL[0] : select('.branch span').textContent;
	const currentCompare = compareURL[compareURL.length - 1];

	wrap(compareIcon, <a href={`/${pageDetect.getRepoURL()}/compare/${currentCompare}...${currentBase}`}></a>);
};
