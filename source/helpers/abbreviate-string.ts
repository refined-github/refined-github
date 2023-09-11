export default function abbreviateString(string_: string, length: number, abbrevMarker = '…'): string {
	return string_.slice(0, length) + abbrevMarker;
}
