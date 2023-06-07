import {globalCache} from 'webext-storage-cache';

export default async function clearCacheHandler(event: MouseEvent): Promise<void> {
	await globalCache.clear();
	const button = event.target as HTMLButtonElement;
	const initialText = button.textContent;
	button.textContent = 'Cache cleared!';
	button.disabled = true;
	setTimeout(() => {
		button.textContent = initialText;
		button.disabled = false;
	}, 2000);
}
