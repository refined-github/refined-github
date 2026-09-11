/** @type {import('eslint').Rule.RuleModule} */
const noSingleIsWhere = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		schema: [],
		messages: {
			unnecessaryFunction: 'Remove unnecessary single-item function.',
		},
	},

	create(context) {
		const {sourceCode} = context;

		function check(node) {
			if (node?.type === 'PseudoClassSelector' && node.name.toLowerCase() === 'is') {
				const children = [...node.children];

				if (children.length === 1 && children[0].type === 'SelectorList') {
					const selectors = [...children[0].children];

					if (selectors.length === 1 && [...selectors[0].children].every(child => child.type !== 'Combinator')) {
						context.report({
							node,
							messageId: 'unnecessaryFunction',
							fix(fixer) {
								return fixer.replaceText(
									node,
									sourceCode.getText(selectors[0]),
								);
							},
						});
					}
				}
			}

			if (node?.children) {
				for (const child of node.children) {
					check(child);
				}
			}
		}

		return {
			Rule(rule) {
				if (rule.prelude?.type !== 'SelectorList') {
					return;
				}

				check(rule.prelude);
			},
		};
	},
};

export default noSingleIsWhere;
