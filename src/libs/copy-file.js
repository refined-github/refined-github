import copyToClipboard from 'copy-text-to-clipboard';
import {select, exists} from './util';

export default () => {
	// Button already added (partial page nav), or non-text file
	if (exists('.copy-btn') || !exists('[data-line-number="1"]')) {
		return;
	}

	const targetSibling = select('#raw-url');
	const fileUri = targetSibling.getAttribute('href');
	$(`<a href="${fileUri}" class="btn btn-sm BtnGroup-item copy-btn">Copy</a>`).insertBefore(targetSibling);

	$(document).on('click', '.copy-btn', e => {
		e.preventDefault();
		const fileContents = select('.js-file-line-container').innerText;
		copyToClipboard(fileContents);
	});
};
