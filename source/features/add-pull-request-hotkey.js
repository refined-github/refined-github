import select from 'select-dom';

export default function () {
	const tabnavSelector = '.tabnav-tab.js-pjax-history-navigate';

	const conversation = select(`${tabnavSelector} > .octicon-comment-discussion`)
		.parentNode;
	const commits = select(`${tabnavSelector} > .octicon-git-commit`).parentNode;
	const files = select(`${tabnavSelector} > .octicon-diff`).parentNode;

	const conversationHotKey = ['p 1'];
	const commitsHotKey = ['p 2'];
	const filesHotKey = ['p 3'];

	if (conversation.className.includes('selected')) {
		commitsHotKey.push('p ArrowRight');
	}

	if (commits.className.includes('selected')) {
		conversationHotKey.push('p ArrowLeft');
		filesHotKey.push('p ArrowRight');
	}

	if (files.className.includes('selected')) {
		commitsHotKey.push('p ArrowLeft');
	}

	conversation.setAttribute('data-hotkey', conversationHotKey);
	commits.setAttribute('data-hotkey', commitsHotKey);
	files.setAttribute('data-hotkey', filesHotKey);
}
