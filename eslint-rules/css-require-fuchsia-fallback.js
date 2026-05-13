/** @type {import('eslint').Rule.RuleModule} */
const cssRequireFuchsiaFallback = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			missingColorFallback: 'Color var() should include `fuchsia` as a fallback.',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const colorVariableRegex = /^--(?:[a-z]+Color-|color-)/;
		const allowedFallbackRegex = /fuchsia|cyan/;

		return {
			Function(node) {
				if (node.name.toLowerCase() !== 'var') {
					return;
				}

				const variable = node.children[0];
				if (variable?.type !== 'Identifier' || !colorVariableRegex.test(variable.name)) {
					return;
				}

				if (!allowedFallbackRegex.test(sourceCode.getText(node).toLowerCase())) {
					context.report({
						node,
						messageId: 'missingColorFallback',
					});
				}
			},
		};
	},
};

export default cssRequireFuchsiaFallback;
