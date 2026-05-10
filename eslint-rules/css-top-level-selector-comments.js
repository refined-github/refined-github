/** @type {import('eslint').Rule.RuleModule} */
const cssTopLevelSelectorComments = {
	meta: {
		type: 'suggestion',
		schema: [{
			type: 'object',
			properties: {
				minComments: {
					type: 'integer',
					minimum: 1,
				},
			},
			additionalProperties: false,
		}],
	},
	create(context) {
		const {sourceCode} = context;
		const commentsByLine = new Map();
		for (const comment of sourceCode.comments ?? []) {
			const {start, end} = comment.loc;
			const {line: startLine} = start;
			const {line: endLine} = end;
			for (let line = startLine; line <= endLine; line++) {
				commentsByLine.set(line, comment);
			}
		}

		const [{minComments = 3} = {}] = context.options;

		return {
			StyleSheet(node) {
				for (const child of node.children) {
					if (child.type !== 'Rule') {
						continue;
					}

					let line = child.loc.start.line - 1;
					let leadingCommentCount = 0;
					while (line >= 1) {
						// `line` is 1-based from source locations; sourceCode.lines is 0-based.
						const lineText = (sourceCode.lines[line - 1] ?? '').trim();
						if (lineText === '') {
							line--;
							continue;
						}

						const comment = commentsByLine.get(line);
						if (!comment) {
							break;
						}

						leadingCommentCount++;
						line = comment.loc.start.line - 1;
					}

					if (leadingCommentCount < minComments) {
						context.report({
							node: child,
							message: `Top-level selectors in this file must be preceded by ${minComments} separate comment blocks.`,
						});
					}
				}
			},
		};
	},
};

export default cssTopLevelSelectorComments;
