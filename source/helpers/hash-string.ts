export default function hashString(string: string): string {
	let hash = 0;

	for (const character of string) {
		// eslint-disable-next-line no-bitwise
		hash = ((hash << 5) - hash) + character.codePointAt(0)!;
	}

	return String(Math.trunc(hash));
}
