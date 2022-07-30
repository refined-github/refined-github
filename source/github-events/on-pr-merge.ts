import select from 'select-dom';

import observeElement from '../helpers/simplified-element-observer';

export default function onPrMerge(callback: VoidFunction): Deinit {
	return observeElement('.discussion-timeline-actions', (_, observer) => {
		if (select.exists('.TimelineItem-badge .octicon-git-merge')) {
			observer.disconnect();
			callback();
		}
	}, {childList: true});
}
