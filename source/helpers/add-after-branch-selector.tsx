import React from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';

import {wrapAll} from './dom-utils.js';

export default async function addAfterBranchSelector(button: Element): Promise<void> {
	button.classList.add('ml-2');
	const branchSelector = (await elementReady('#branch-select-menu', {waitForChildren: false}))!;
	const branchSelectorWrapper = branchSelector.closest('.position-relative')!;
	const breadcrumb = select('.breadcrumb');
	if (!breadcrumb) {
		branchSelectorWrapper.after(button);
		return;
	}

	branchSelectorWrapper.append(button);
	if (branchSelector.classList.contains('rgh-wrapper-added')) {
		return;
	}

	breadcrumb.classList.add('flex-shrink-0');
	breadcrumb.classList.remove('mt-3');
	branchSelector.classList.add('rgh-wrapper-added');
	branchSelectorWrapper.classList.add('d-flex', 'flex-shrink-0');
	wrapAll([branchSelectorWrapper, breadcrumb], <div className="d-flex flex-wrap flex-1 mr-2" style={{rowGap: '16px'}}/>);
}
