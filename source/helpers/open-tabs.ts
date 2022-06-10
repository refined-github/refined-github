export default function openTabs(urls: string[]): boolean {
	if (urls.length >= 10 && !confirm(`This will open ${urls.length} new tabs. Continue?`)) {
		return false;
	}

	void browser.runtime.sendMessage({
		openUrls: urls,
	});

	return true;
}
