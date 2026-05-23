/** @type {import('eslint').Rule.RuleModule} */
const cssRequireFuchsiaFallback = {
	meta: {
		type: 'problem',
		schema: [],
		messages: {
			missingColorFallback:
				'Color var() should include `fuchsia` or `cyan` as a fallback. https://github.com/refined-github/refined-github/pull/7804#issuecomment-2357444089',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const colorVariableRegex = /^--(?:[a-z]+Color-|color-)/;
		const fallbackColorPatternRegex = /fuchsia|cyan/;

		return {
			Function(node) {
				if (node.name.toLowerCase() !== 'var') {
					return;
				}

				const variable = node.children[0];
				if (variable?.type !== 'Identifier' || !colorVariableRegex.test(variable.name)) {
					return;
				}

				if (!fallbackColorPatternRegex.test(sourceCode.getText(node).toLowerCase())) {
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
