import select from 'select-dom';

import observeElement from '../helpers/simplified-element-observer';

export default function onConversationHeaderUpdate(callback: VoidFunction, options?: MutationObserverInit): void {
	const conversationHeader = select('#partial-discussion-header');
	if (conversationHeader) {
		observeElement(conversationHeader.parentElement!, callback, {
			childList: true,
			...options
		});
	}
}
