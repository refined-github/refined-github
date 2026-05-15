/** @type {import('eslint').Rule.RuleModule} */
const cssRequireEmFallback = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			missingFallback:
				'var() should include `2.22em` or `22.22em` as a fallback.',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const allowedFallbackPatternRegex = /\b(?:2|22)\.22em\b/;
		const isExcludedVariable = variableName =>
			variableName.startsWith('--rgh-')
			|| variableName.startsWith('--color-')
			|| variableName.includes('Color-')
			|| /--[a-z-]+-(?:r|g|b|h|s|l)$/.test(variableName);
		const stripCssComments = text => text.replaceAll(/\/\*[\s\S]*?\*\//g, '');
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

				const variable = node.children[0];
				if (variable?.type !== 'Identifier') {
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
