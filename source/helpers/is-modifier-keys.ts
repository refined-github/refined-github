export default function isModifierKeys(event: MouseEvent | React.MouseEvent): boolean {
	return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}
