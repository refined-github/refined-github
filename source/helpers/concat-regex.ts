export default function concatRegex(...expressions: Array<RegExp | string>): RegExp {
	const sources = expressions.map(expression => expression instanceof RegExp ? expression.source : expression);
	const flags = expressions.map(expression => expression instanceof RegExp ? expression.flags : '');
	return new RegExp(sources.join(''), flags.join(''));
}
