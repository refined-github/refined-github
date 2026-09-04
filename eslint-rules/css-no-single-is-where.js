/** @type {import('eslint').Rule.RuleModule} */
const noSingleIsWhere = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		schema: [],
		messages: {
			singleItem: 'Avoid using :{{name}}() with only one selector. Write the inner selector directly instead.',
		},
	},
	create(context) {
		const {sourceCode} = context;

		return {
			PseudoClassSelector(node) {
				const name = node.name.toLowerCase();
				if (name !== 'is' && name !== 'where') {
					return;
				}

				// `@eslint/css` uses CSSTree AST where parameters are stored in `node.for` or `node.children`
				const selectorList = node.for?.type === 'SelectorList'
					? node.for
					: [...(node.children || [])].find((child) => child.type === 'SelectorList');

				if (!selectorList) {
					return;
				}

				const innerSelectors = [...selectorList.children];

				if (innerSelectors.length === 1) {
					const singleSelector = innerSelectors[0];
					context.report({
						node,
						messageId: 'singleItem',
						data: {name},
						fix(fixer) {
							const innerText = sourceCode.getText(singleSelector).trim();
							return fixer.replaceText(node, innerText);
						},
					});
				}
			},
		};
	},
};

export default noSingleIsWhere;
