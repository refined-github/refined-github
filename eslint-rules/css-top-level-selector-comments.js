/** @type {import('eslint').Rule.RuleModule} */
const cssTopLevelSelectorComments = {
	meta: {
		type: 'suggestion',
		schema: [],
	},
	create(context) {
		const {sourceCode} = context;
		const comments = sourceCode.comments ?? [];

		return {
			StyleSheet(node) {
				for (const child of node.children) {
					if (child.type !== 'Rule') {
						continue;
					}

					let line = child.loc.start.line - 1;
					let leadingCommentCount = 0;
					while (line >= 1) {
						const lineText = (sourceCode.lines[line - 1] ?? '').trim();
						if (lineText === '') {
							line--;
							continue;
						}

						const comment = comments.findLast(comment =>
							comment.loc.start.line <= line
							&& comment.loc.end.line >= line,
						);
						if (!comment) {
							break;
						}

						leadingCommentCount++;
						line = comment.loc.start.line - 1;
					}

					if (leadingCommentCount < 3) {
						context.report({
							node: child,
							message: 'Top-level selectors in this file must be preceded by 3 comments.',
						});
					}
				}
			},
		};
	},
};

export default cssTopLevelSelectorComments;
