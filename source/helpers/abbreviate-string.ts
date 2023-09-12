export default function abbreviateString(string: string, length: number): string {
	return string.length < length
		? string
		: string.slice(0, length) + '…';
}
