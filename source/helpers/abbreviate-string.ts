export default function abbreviateString(string_: string, length: number): string {
	return string_.slice(0, length) + '…';
}
