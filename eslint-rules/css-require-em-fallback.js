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
		const {sourceCode} = context;
		const allowedFallbackPatternRegex = /\b(?:2\.22|4\.44|22\.22)em\b/;
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
		const colorChannelSuffixes = ['-r', '-g', '-b', '-h', '-s', '-l'];
		const isExcludedVariable = variableName =>
			variableName.startsWith('--rgh-')
			|| variableName.startsWith('--color-')
			|| variableName.includes('Color-')
			|| colorChannelSuffixes.some(channel => variableName.endsWith(channel));
		const stripCssComments = text => text.replaceAll(/\/\*[\s\S]*?\*\//g, '');
		const isLengthProperty = propertyName => lengthPropertyFragments.some(fragment => propertyName.includes(fragment));
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
