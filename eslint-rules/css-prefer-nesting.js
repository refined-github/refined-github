/** @type {import('eslint').Rule.RuleModule} */
const preferNesting = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		schema: [],
		messages: {
			descendantIs: 'Avoid `:is()` used with a descendant combinator. Use CSS nesting instead.',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const isDescendant = node => node?.type === 'Combinator' && node.name.trim() === '';

		return {
			Rule(rule) {
				if (rule.prelude?.type !== 'SelectorList') {
					return;
				}

				const selectors = [...rule.prelude.children];
				for (const selector of selectors) {
					const children = [...selector.children];
					for (const [index, child] of children.entries()) {
						if (child.type !== 'PseudoClassSelector' || child.name.toLowerCase() !== 'is') {
							continue;
						}

						const before = isDescendant(children[index - 1]);
						const after = isDescendant(children[index + 1]);
						if (!before && !after) {
							continue;
						}

						context.report({
							node: child,
							messageId: 'descendantIs',
							fix(fixer) {
								if (selectors.length !== 1) {
									return;
								}

								const text = sourceCode.getText();
								const isText = sourceCode.getText(child);
								const arguments_ = isText.slice(isText.indexOf('(') + 1, -1).trim();
								const block = sourceCode.getText(rule.block);

								// `X :is(A, B)` -> `X { A, B { … } }`
								if (before && index === children.length - 1) {
									const outer = text.slice(children[0].loc.start.offset, children[index - 2].loc.end.offset).trim();
									return fixer.replaceText(rule, `${outer} {\n\t${arguments_} ${block}\n}`);
								}

								// `:is(A, B) X` -> `A, B { X { … } }`
								if (after && index === 0) {
									const rest = text.slice(children[index + 2].loc.start.offset, children.at(-1).loc.end.offset).trim();
									return fixer.replaceText(rule, `${arguments_} {\n\t${rest} ${block}\n}`);
								}
							},
						});
					}
				}
			},
		};
	},
};

export default preferNesting;
