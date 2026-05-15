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
		const colorVariableRegex = /^--(?:[a-z]+Color-|color-)/;
		const allowedFallbackPatternRegex = /22\.22em|2\.22em/;
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

				if (colorVariableRegex.test(variable.name) || variable.name.startsWith('--rgh-')) {
					return;
				}

				pendingChecks.push({
					node,
					variable: variable.name,
					hasAllowedFallback: allowedFallbackPatternRegex.test(sourceCode.getText(node).toLowerCase()),
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
