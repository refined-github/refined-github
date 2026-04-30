/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		messages: {
			useSelectDom: 'Use select-dom\'s {{replacement}}() instead of .{{method}}()',
			useNativeQs: 'Use .{{method}}(selector) instead of {{fn}}(selector, element) when element uses a traversal',
		},
		schema: [],
	},
	create(context) {
		const {sourceCode} = context;
		return {
			// Part 1: x.querySelector(sel) with a simple receiver → $(sel, x)
			'CallExpression[callee.type=MemberExpression]:matches([callee.property.name=querySelector], [callee.property.name=querySelectorAll])'(node) {
				const {object} = node.callee;
				// Only flag simple cases: bare variable or `this`
				// Allow traversals: x.firstChild.querySelector, x.closest().querySelector, x!.querySelector, etc.
				if (object.type !== 'Identifier' && object.type !== 'ThisExpression') {
					return;
				}

				const methodName = node.callee.property.name;
				const isQueryAll = methodName === 'querySelectorAll';
				const replacement = isQueryAll ? '$$' : '$';

				// Treat `document` as global only if it's not shadowed by a local variable
				const isGlobalDocument = (() => {
					if (object.type !== 'Identifier' || object.name !== 'document') {
						return false;
					}

					// Walk up the scope chain to check for a local `document` binding
					let scope = sourceCode.getScope(node);
					while (scope) {
						if (scope.variables.some(v => v.name === 'document')) {
							return false; // Locally declared, not the global
						}

						scope = scope.upper;
					}

					return true;
				})();

				context.report({
					node,
					messageId: 'useSelectDom',
					data: {replacement, method: methodName},
					fix(fixer) {
						const arguments_ = node.arguments.map(argument => sourceCode.getText(argument));
						if (!isGlobalDocument) {
							arguments_.push(sourceCode.getText(object));
						}

						return fixer.replaceText(node, `${replacement}(${arguments_.join(', ')})`);
					},
				});
			},

			// Part 2: $(sel, x.traversal) or $$(sel, x.traversal) → x.traversal.querySelector(sel)
			'CallExpression:matches([callee.name=$], [callee.name=$$])'(node) {
				const base = node.arguments[1];
				if (!base) {
					return;
				}

				// Flag when the base element is a traversal (not a simple identifier)
				if (base.type !== 'MemberExpression' && base.type !== 'CallExpression') {
					return;
				}

				// Skip array selectors — native querySelector doesn't accept arrays
				if (node.arguments[0]?.type === 'ArrayExpression') {
					return;
				}

				const isQueryAll = node.callee.name === '$$';
				const method = isQueryAll ? 'querySelectorAll' : 'querySelector';

				context.report({
					node,
					messageId: 'useNativeQs',
					data: {method, fn: node.callee.name},
					fix(fixer) {
						const selector = sourceCode.getText(node.arguments[0]);
						const baseText = sourceCode.getText(base);
						// QuerySelector returns null (unlike $ which throws), so add ! to preserve semantics
						const bang = isQueryAll ? '' : '!';
						return fixer.replaceText(node, `${baseText}.${method}(${selector})${bang}`);
					},
				});
			},
		};
	},
};

export default rule;
