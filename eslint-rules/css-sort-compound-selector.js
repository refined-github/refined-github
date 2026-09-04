/** @type {import('eslint').Rule.RuleModule} */
const sortCompoundSelector = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		schema: [],
		messages: {
			sort: 'Sort compound selector components.',
		},
	},

	create(context) {
		const order = {
			TypeSelector: 0,
			IdSelector: 1,
			ClassSelector: 2,
			AttributeSelector: 3,
			PseudoClassSelector: 4,
			PseudoElementSelector: 5,
		};

		return {
			Selector(node) {
				const selectors = [...node.children];

				const sorted = selectors.toSorted(
					(a, b) => order[a.type] - order[b.type],
				);

				if (
					selectors.every(
						(selector, index) => selector === sorted[index],
					)
				) {
					return;
				}

				context.report({
					node,
					messageId: 'sort',
					fix(fixer) {
						return selectors.map((selector, index) =>
							fixer.replaceText(
								selector,
								context.sourceCode.getText(sorted[index]),
							)
						);
					},
				});
			},
		};
	},
};

export default sortCompoundSelector;
