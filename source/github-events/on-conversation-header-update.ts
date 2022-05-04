import select from 'select-dom';

export default function onConversationHeaderUpdate(callback: VoidFunction): void | Deinit {
	const conversationHeader = select('#partial-discussion-header');
	if (!conversationHeader) {
		return;
	}

	const observer = new MutationObserver(callback);
	observer.observe(conversationHeader.parentElement!, {
		childList: true,
	});

	return observer;
}
