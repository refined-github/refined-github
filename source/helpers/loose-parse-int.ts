export default function looseParseInt(text: Node | string): number {
	if (typeof text !== 'string') {
		text = text.textContent!;
	}

	return Number(text.replace(/\D+/g, ''));
}
