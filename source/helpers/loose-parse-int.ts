export default function looseParseInt(text: ChildNode | string | undefined): number {
	if (!text) {
		return 0;
	}

	if (typeof text !== 'string') {
		text = text.textContent;
	}

	return Number(text.replaceAll(/\D+/g, ''));
}
