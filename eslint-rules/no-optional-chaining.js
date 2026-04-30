/** @type {import('eslint').Rule.RuleModule} */
export default {
	create(context) {
		const {sourceCode} = context;
		return {
			'MemberExpression[optional=true]'(node) {
				// Exception: usage is on a line with an inline comment, or preceded by a comment explaining why
				const currentLine = (sourceCode.lines[node.loc.start.line - 1] ?? '');
				const hasInlineComment = /\/\//.test(currentLine.slice(currentLine.indexOf('?.') + 2));
				const previousLine = (sourceCode.lines[node.loc.start.line - 2] ?? '').trim();
				if (hasInlineComment || previousLine.startsWith('//') || previousLine.endsWith('*/')) {
					return;
				}

				if (node.object.type === 'CallExpression' && node.object.callee.name === '$') {
					context.report({
						node,
						message: 'Either use $optional() with `?.` or $() without. $() will throw when the element is not found.',
					});
					return;
				}

				context.report({
					node,
					message: 'Use `!.` instead of `?.`. Add a comment on the same or preceding line describing in which scenario the value can CURRENTLY be null. If you cannot find such a scenario, use `!.` instead.',
				});
			},
		};
	},
};
