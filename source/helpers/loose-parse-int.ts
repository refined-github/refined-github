export default function looseParseInt(text: string): number {
	return Number(text.replace(/\D+/g, ''));
}
