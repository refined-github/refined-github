/** @type {import('eslint').Rule.RuleModule} */
const cssRequireEmFallback = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			missingFallback: 'var() should include `2.22em`, `4.44em`, or `22.22em` as a fallback.',
		},
	},
	create(context) {
		const allowedFallbackPatternRegex = /\b(?:2\.22|4\.44|22\.22)em\b/;
		const variableFunctionRegex = /var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/gi;
		const lengthPropertyFragments = [
			'margin',
			'padding',
			'inset',
			'width',
			'height',
			'size',
			'radius',
			'border',
			'outline',
			'gap',
			'top',
			'right',
			'bottom',
			'left',
			'indent',
			'spacing',
			'basis',
			'grid-template',
			'grid-auto',
		];
		const isExcludedVariable = variableName =>
			variableName.startsWith('--rgh-')
			|| variableName.startsWith('--color-')
			|| variableName.includes('Color-')
			|| variableName.endsWith('-r')
			|| variableName.endsWith('-g')
			|| variableName.endsWith('-b')
			|| variableName.endsWith('-h')
			|| variableName.endsWith('-s')
			|| variableName.endsWith('-l');
		const stripCssComments = text => text.replaceAll(/\/\*[\s\S]*?\*\//g, '');
		const isLengthProperty = propertyName => lengthPropertyFragments.some(fragment => propertyName.includes(fragment));

		const localVariables = new Set();
		const pendingChecks = [];

		return {
			Declaration(node) {
				if (typeof node.property === 'string' && node.property.startsWith('--')) {
					localVariables.add(node.property);
					return;
				}

				if (!isLengthProperty(node.property.toLowerCase())) {
					return;
				}

				const declarationText = stripCssComments(context.sourceCode.getText(node));
				for (const [, variableName, fallback] of declarationText.matchAll(variableFunctionRegex)) {
					if (isExcludedVariable(variableName)) {
						continue;
					}

					pendingChecks.push({
						node,
						variable: variableName,
						hasAllowedFallback: allowedFallbackPatternRegex.test(fallback ?? ''),
					});
				}
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
