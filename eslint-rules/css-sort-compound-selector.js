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
				let compound = [];

				const checkCompound = () => {
					if (compound.length < 2) {
						compound = [];
						return;
					}

					const sorted = compound.toSorted(
						(a, b) => order[a.type] - order[b.type],
					);

					if (
						compound.every(
							(selector, index) => selector === sorted[index],
						)
					) {
						compound = [];
						return;
					}

					context.report({
						node,
						messageId: 'sort',
						fix(fixer) {
							return compound.map((selector, index) =>
								fixer.replaceText(
									selector,
									context.sourceCode.getText(
										sorted[index],
									),
								)
							);
						},
					});

					compound = [];
				};

				for (const child of node.children) {
					if (child.type === 'Combinator') {
						checkCompound();
					} else {
						compound.push(child);
					}
				}

				checkCompound();
			},
		};
	},
};

export default sortCompoundSelector;
