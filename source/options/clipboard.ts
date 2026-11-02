/** Needs a user gesture. Firefox 147+ and Safari show a paste prompt, Chrome asks for permission once */
export async function readClipboardText(): Promise<string> {
	const text = await navigator.clipboard.readText();
	return text.trim();
}

/** Works for Ctrl/Cmd+V and the context menu, without prompts or permissions */
export function getPastedText({clipboardData}: ClipboardEvent): string {
	return clipboardData?.getData('text/plain').trim() ?? '';
}

export async function copyText(text: string): Promise<void> {
	await navigator.clipboard.writeText(text);
}
