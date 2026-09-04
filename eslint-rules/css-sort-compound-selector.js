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
    return {
      CompoundSelector(node) {
        const order = {
          type: 0,
          id: 1,
          class: 2,
          attribute: 3,
          pseudoClass: 4,
          pseudoElement: 5,
        };

        const selectors = [...node.children];

        const sorted = selectors.toSorted(
          (a, b) => order[a.type] - order[b.type]
        );

        if (selectors.every((selector, index) => selector === sorted[index])) {
          return;
        }

        context.report({
          node,
          messageId: 'sort',
          fix(fixer) {
            return selectors.map((selector, index) =>
              fixer.replaceText(
                selector,
                context.sourceCode.getText(sorted[index])
              )
            );
          },
        });
      },
    };
  },
};

export default sortCompoundSelector;
