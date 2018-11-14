import {h} from 'dom-chef';
import select from 'select-dom';
import {wrap} from '../libs/utils';
import {getRepoPath, getRepoURL} from '../libs/page-detect';

export default function () {
	const references = getRepoPath().replace('compare/', '').split('...').reverse();

	// Compares against the "base" branch if the URL only has one reference
	if (references.length === 1) {
		references.unshift(select('.branch span').textContent);
	}

	const icon = select('.octicon-arrow-left');
	icon.parentNode.attributes['aria-label'].value += '.\nClick to swap.';
	wrap(icon, <a href={`/${getRepoURL()}/compare/${references.join('...')}`}></a>);
}
