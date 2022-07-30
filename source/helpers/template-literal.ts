// Enables highlighting/prettifying when used as html`<div>` or css`.a {}`
// https://prettier.io/blog/2020/08/24/2.1.0.html
export function concatenateTemplateLiteralTag(
	strings: TemplateStringsArray,
	...keys: string[]
): string {
	return strings
		.map((string, i) => string + (i < keys.length ? keys[i] : ''))
		.join('');
}

export const html = concatenateTemplateLiteralTag;
export const css = concatenateTemplateLiteralTag;
