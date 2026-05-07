export default function stripLeadingPinEmoji(text: string): string {
	return text.replace(/^\s*📌\s*/u, '');
}
