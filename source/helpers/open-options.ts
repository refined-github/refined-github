export default function openOptions(event: Event): void {
	event.preventDefault();
	void browser.runtime.sendMessage({openOptionsPage: true});
}
