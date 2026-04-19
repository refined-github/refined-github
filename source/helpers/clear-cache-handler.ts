import {globalCache} from 'webext-storage-cache';

export default async function clearCacheHandler(this: HTMLButtonElement): Promise<void> {
	await globalCache.clear();
	const initialText = this.textContent;
	this.textContent = 'Cache cleared!';
	this.disabled = true;
	setTimeout(() => {
		this.textContent = initialText;
		this.disabled = false;
	}, 2000);
}
