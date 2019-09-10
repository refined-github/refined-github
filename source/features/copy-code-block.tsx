import './copy-code-block.css';
import React from 'dom-chef';
import select from 'select-dom';
import copyToClipboard from 'copy-text-to-clipboard';
import features from '../libs/features';
import { clippy } from '../libs/icons';

function handleClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): void {
	if (button.previousSibling && button.previousSibling.textContent) {
		copyToClipboard(button.previousSibling.textContent);
	}
}

function renderButton(): void {
	for (const codeBlock of select.all('code')) {
		console.log(codeBlock);
		codeBlock
			.after(
              <button className="copy-code-block btn-link" aria-label="Copy the code block" onClick={handleClick}>
				  {clippy()}
              </button>
			);
	}
}

function init(): void {
	if (select.exists('code')) {
		renderButton();
	}
}

features.add({
	id: __featureName__,
	description: 'Adds a button to copy a code block.',
	screenshot: 'https://user-images.githubusercontent.com/2752200/64599415-3d24ba00-d3b1-11e9-81fa-ece84802b2c4.png',
	load: features.onAjaxedPages,
	init
});
