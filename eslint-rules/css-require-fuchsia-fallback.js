/** @type {import('eslint').Rule.RuleModule} */
const cssRequireFuchsiaFallback = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			missingFuchsiaFallback: 'Color var() should include `fuchsia` as a fallback.',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const colorVariableRegex = /^--(?:[a-z]+Color-|color-)/;

		return {
			Function(node) {
				if (node.name.toLowerCase() !== 'var') {
					return;
				}

				const variable = node.children[0];
				if (variable?.type !== 'Identifier' || !colorVariableRegex.test(variable.name)) {
					return;
				}

				if (!sourceCode.getText(node).toLowerCase().includes('fuchsia')) {
					context.report({
						node,
						messageId: 'missingFuchsiaFallback',
					});
				}
			},
		};
	},
};

export default cssRequireFuchsiaFallback;
