const keyOrder = [
	'shortcuts',
	'asLongAs',
	'include',
	'exclude',
	'awaitDomReady',
	'requiresToken',
	'deduplicate',
	'init',
];

const conditionKeys = new Set(['asLongAs', 'include', 'exclude']);

const getKey = property =>
	property.type === 'Property' && property.key.type === 'Identifier' && !property.computed
		? property.key.name
		: undefined;

/** @type {import('eslint').Rule.RuleModule} */
const consistentFeatureAdd = {
	meta: {
		type: 'layout',
		fixable: 'code',
		schema: [],
	},
	create(context) {
		const {sourceCode} = context;

		// Extends a property to include the comments that belong to it (preceding lines and same-line trailing)
		function getPropertyRange(property, properties) {
			const index = properties.indexOf(property);
			const previous = properties[index - 1];
			const before = sourceCode.getTokenBefore(property, {includeComments: true});
			let start = property.range[0];
			let token = before;
			const previousCode = sourceCode.getTokenBefore(property);
			while (
				token !== previous
				&& token
				&& (token.type === 'Line' || token.type === 'Block')
				// Same-line comments after the previous comma belong to the previous property
				&& token.loc.start.line > previousCode.loc.end.line
			) {
				start = token.range[0];
				token = sourceCode.getTokenBefore(token, {includeComments: true});
			}

			const comma = sourceCode.getTokenAfter(property);
			let end = property.range[1];
			if (comma?.value === ',') {
				end = comma.range[1];
				for (const comment of sourceCode.getCommentsAfter(comma)) {
					if (comment.loc.start.line === comma.loc.end.line) {
						end = comment.range[1];
					}
				}
			}

			return [start, end];
		}

		return {
			'CallExpression[callee.object.name="features"][callee.property.name="add"]'(node) {
				const options = node.arguments[1];
				if (options?.type !== 'ObjectExpression') {
					return;
				}

				const {properties} = options;

				// Arrays: one item per line
				for (const property of properties) {
					const key = getKey(property);
					const array = property.type === 'Property' ? property.value : undefined;
					if (!conditionKeys.has(key) || array?.type !== 'ArrayExpression' || array.elements.length === 0) {
						continue;
					}

					const {elements} = array;
					const isMultiline = array.loc.start.line < elements[0].loc.start.line
						&& elements.at(-1).loc.end.line < array.loc.end.line
						&& elements.every((element, index) => index === 0 || elements[index - 1].loc.end.line < element.loc.start.line);
					if (isMultiline) {
						continue;
					}

					context.report({
						node: array,
						message: `Put each item of \`${key}\` on its own line.`,
						fix(fixer) {
							if (sourceCode.getCommentsInside(array).length > 0) {
								return undefined;
							}

							const indent = sourceCode.lines[property.loc.start.line - 1].match(/^\s*/)[0];
							const items = elements.map(element => `${indent}\t${sourceCode.getText(element)},`);
							return fixer.replaceText(array, `[\n${items.join('\n')}\n${indent}]`);
						},
					});
				}

				// Key order
				const keys = properties.map(property => getKey(property));
				if (keys.includes(undefined)) {
					return;
				}

				const sorted = properties.toSorted((a, b) => {
					const indexA = keyOrder.indexOf(getKey(a));
					const indexB = keyOrder.indexOf(getKey(b));
					return (indexA === -1 ? keyOrder.length : indexA) - (indexB === -1 ? keyOrder.length : indexB);
				});

				if (sorted.every((property, index) => property === properties[index])) {
					return;
				}

				context.report({
					node: options,
					message: `Keys must be in this order: ${keyOrder.join(', ')}.`,
					fix(fixer) {
						const ranges = properties.map(property => getPropertyRange(property, properties));
						return sorted.map((property, index) => {
							const range = ranges[properties.indexOf(property)];
							let text = sourceCode.text.slice(...range);
							// Ensure every moved property keeps its trailing comma
							if (!text.includes(',') && index < properties.length) {
								text += ',';
							}

							return fixer.replaceTextRange(ranges[index], text);
						});
					},
				});
			},
		};
	},
};

export default consistentFeatureAdd;
