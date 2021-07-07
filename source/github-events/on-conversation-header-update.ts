import select from 'select-dom';

export default function onConversationHeaderUpdate(callback: VoidFunction): void {
	const conversationHeader = select('#partial-discussion-header');
	if (conversationHeader) {
		new MutationObserver(callback).observe(conversationHeader.parentElement!, {
			childList: true,
		});
	}
}
