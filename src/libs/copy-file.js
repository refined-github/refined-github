import copyToClipboard from 'copy-text-to-clipboard';
import select from 'select-dom';
import {h} from 'dom-chef';

export default () => {
	// Button already added (partial page nav), or non-text file
	if (select.exists('.copy-btn') || !select.exists('[data-line-number="1"]')) {
		return;
	}

	const targetSibling = select('#raw-url');
	const fileUri = targetSibling.getAttribute('href');
	targetSibling.insertAdjacentElement('beforeBegin',
		<a href={fileUri} class="btn btn-sm BtnGroup-item copy-btn">Copy</a>
	);

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = select('.js-file-line-container').innerText;
		copyToClipboard(fileContents);
	});
};
