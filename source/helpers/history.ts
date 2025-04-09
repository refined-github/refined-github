export default function removeHashFromUrlBar(): void {
	const url = new URL(location.href);
	url.hash = '';
	history.replaceState(history.state, '', url.href);
}
