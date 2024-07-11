export default function openOptions(event: Event): void {
	event.preventDefault();
	void chrome.runtime.sendMessage({openOptionsPage: true});
}
