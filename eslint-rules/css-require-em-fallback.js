/** @type {import('eslint').Rule.RuleModule} */
const cssRequireEmFallback = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			missingFallback: 'var() should include `2.22em` or `22.22em` as a fallback.',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const allowedFallbackPatternRegex = /\b(?:2|22)\.22em\b/;
		const exactLengthProperties = new Set([
			'font-size',
			'line-height',
			'border',
			'outline',
			'min-width',
			'max-width',
			'min-height',
			'max-height',
			'inline-size',
			'block-size',
			'min-inline-size',
			'max-inline-size',
			'min-block-size',
			'max-block-size',
			'flex-basis',
			'grid-template-columns',
			'grid-template-rows',
			'grid-auto-columns',
			'grid-auto-rows',
			'text-indent',
			'letter-spacing',
			'word-spacing',
			'column-gap',
			'row-gap',
			'gap',
			'column-width',
			'border-spacing',
			'outline-width',
			'outline-offset',
			'top',
			'right',
			'bottom',
			'left',
		]);
		const lengthPropertyFragments = [
			'margin',
			'padding',
			'inset',
			'width',
			'height',
			'radius',
			'border-width',
			'border-image-width',
			'border-image-outset',
		];
		const colorChannelSuffixes = ['-r', '-g', '-b', '-h', '-s', '-l'];
		const isExcludedVariable = variableName =>
			variableName.startsWith('--rgh-')
			|| variableName.startsWith('--color-')
			|| variableName.includes('Color-')
			|| colorChannelSuffixes.some(channel => variableName.endsWith(channel));
		const stripCssComments = text => text.replaceAll(/\/\*[\s\S]*?\*\//g, '');
		const isLengthProperty = propertyName =>
			exactLengthProperties.has(propertyName)
			|| lengthPropertyFragments.some(fragment => propertyName.includes(fragment));
		const getPropertyName = node => {
			for (const ancestor of sourceCode.getAncestors(node).toReversed()) {
				if (ancestor.type === 'Declaration' && typeof ancestor.property === 'string') {
					return ancestor.property.toLowerCase();
				}
			}

			return undefined;
		};

		const localVariables = new Set();
		const pendingChecks = [];

		return {
			Declaration(node) {
				if (typeof node.property === 'string' && node.property.startsWith('--')) {
					localVariables.add(node.property);
				}
			},
			Function(node) {
				if (node.name.toLowerCase() !== 'var') {
					return;
				}

				const [variable] = node.children;
				if (variable?.type !== 'Identifier') {
					return;
				}

				const propertyName = getPropertyName(node);
				if (!propertyName || !isLengthProperty(propertyName)) {
					return;
				}

				if (isExcludedVariable(variable.name)) {
					return;
				}

				const textWithoutComments = stripCssComments(sourceCode.getText(node)).toLowerCase();

				pendingChecks.push({
					node,
					variable: variable.name,
					hasAllowedFallback: allowedFallbackPatternRegex.test(textWithoutComments),
				});
			},
			'StyleSheet:exit'() {
				for (const check of pendingChecks) {
					if (localVariables.has(check.variable) || check.hasAllowedFallback) {
						continue;
					}

					context.report({
						node: check.node,
						messageId: 'missingFallback',
					});
				}
			},
		};
	},
};

export default cssRequireEmFallback;
