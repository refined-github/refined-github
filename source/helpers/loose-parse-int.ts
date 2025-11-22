// eslint-disable-next-line @typescript-eslint/no-restricted-types -- Simplify passing random nodes
export default function looseParseInt(text: ChildNode | string | undefined | null): number {
	if (!text) {
		return 0;
	}

	if (typeof text !== 'string') {
		text = text.textContent;
	}

	return Number(text.replaceAll(/\D+/g, ''));
}
