/** Blocks typing and dropping so the field only accepts pasting (Ctrl/Cmd+V and context menu), without reading the clipboard */
export function allowOnlyPaste(event: InputEvent): void {
	if (event.inputType !== 'insertFromPaste') {
		event.preventDefault();
	}
}

/** Write-only, requires a user gesture */
export async function copyText(text: string): Promise<void> {
	await navigator.clipboard.writeText(text);
}
