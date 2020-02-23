import features from '../libs/features';
import select from 'select-dom';

const FILE_FINDER_INPUT_SELECTOR = '.js-tree-finder > .breadcrumb > #tree-finder-field';

let fileFinderBuffer = '';

const isValidCharacter = (char: string): boolean => (
	char.length === 1
) && ((
	char >= 'a' &&
  char <= 'z'
) || (
	char >= 'A' &&
  char <= 'Z'
) || (
	char >= '0' &&
  char <= '9'
));

const keyDownHandler = ({key, target}: KeyboardEvent): void => {
	const nodeName = (target as Element).nodeName;
	if (nodeName !== 'INPUT' && nodeName !== 'TEXTAREA' && isValidCharacter(key)) {
		fileFinderBuffer = `${fileFinderBuffer}${key}`;
	}
};

const pjaxStartHandler = ((event: CustomEvent): void => {
	const destinationURL: string = event.detail.url;
	if (destinationURL.includes('/find/')) {
		window.addEventListener('keydown', keyDownHandler);
	}
}) as EventListener; // Explicit type cast. See https://github.com/microsoft/TypeScript/issues/28357#issuecomment-436484705

const pjaxCompleteHandler = (): void => {
	const input = select<HTMLInputElement>(FILE_FINDER_INPUT_SELECTOR);
	if (input) {
		input.value = fileFinderBuffer.slice(1); // First character is the 't' pressed
		fileFinderBuffer = '';
	}

	window.removeEventListener('keydown', keyDownHandler);
};

function init(): void {
	window.addEventListener('pjax:start', pjaxStartHandler);
	window.addEventListener('pjax:complete', pjaxCompleteHandler);
}

function deinit(): void {
	window.removeEventListener('pjax:beforeSend', pjaxStartHandler);
	window.removeEventListener('pjax:complete', pjaxCompleteHandler);
}

features.add({
	id: __featureName__,
	description: 'Buffering for search term pressed after `t`',
	screenshot: false,
	include: [
		features.isRepoDiscussionList,
		features.isRepoRoot,
		features.isRepoTree,
		features.isSingleFile
	],
	load: features.onAjaxedPages,
	init,
	deinit
});
