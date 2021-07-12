export default function looseParseInt(text: Node | string | undefined): number {
	if (!text) {
		return 0;
	}

	if (typeof text !== 'string') {
		text = text.textContent!;
	}

	return Number(text.replace(/\D+/g, ''));
}
