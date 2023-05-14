import showToast from '../github-helpers/toast.js';
import pluralize from '../helpers/pluralize.js';

export default async function openTabs(urls: string[]): Promise<boolean> {
	if (urls.length >= 10 && !confirm(`This will open ${urls.length} new tabs. Continue?`)) {
		return false;
	}

	const response = browser.runtime.sendMessage({
		openUrls: urls,
	});

	await showToast(response, {
		message: 'Opening…',
		doneMessage: pluralize(urls.length, '$$ tab') + ' opened',
	});

	return true;
}
