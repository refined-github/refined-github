export default async function openTabs(urls: string[]): Promise<boolean> {
	if (urls.length >= 10 && !confirm(`This will open ${urls.length} new tabs. Continue?`)) {
		return false;
	}

	await browser.runtime.sendMessage({
		openUrls: urls,
	});

	return true;
}
