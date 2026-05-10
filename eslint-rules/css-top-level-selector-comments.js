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
		messages: {
			invalidComments:
				'Top-level selectors in this file must be preceded by at least {{minComments}} comment blocks including a description line, an `Info:` line, and a `Test:` line.{{missing}}',
		},
	},
	create(context) {
		const {sourceCode} = context;
		const commentsByEndLine = new Map();
		for (const comment of sourceCode.comments ?? []) {
			commentsByEndLine.set(comment.loc.end.line, comment);
		}

		const [{minComments = 3} = {}] = context.options;
		const isNonDescriptionMetadataLine = comment => comment.startsWith('info:') || comment.startsWith('test:') || comment.startsWith('todo:');

		return {
			StyleSheet(node) {
				for (const child of node.children) {
					if (child.type !== 'Rule') {
						continue;
					}

					let line = child.loc.start.line - 1;
					const leadingComments = [];
					while (line >= 1) {
						// `line` is 1-based from source locations; sourceCode.lines is 0-based.
						const lineText = (sourceCode.lines[line - 1] ?? '').trim();
						if (lineText === '') {
							line--;
							continue;
						}

						const comment = commentsByEndLine.get(line);
						if (!comment) {
							break;
						}

						leadingComments.unshift(comment);
						line = comment.loc.start.line - 1;
					}

					let hasInfo = false;
					let hasTest = false;
					let hasDescription = false;
					for (const comment of leadingComments) {
						const commentValue = comment.value.trim().toLowerCase();
						hasInfo ||= commentValue.startsWith('info:');
						hasTest ||= commentValue.startsWith('test:');
						hasDescription ||= !isNonDescriptionMetadataLine(commentValue);
					}

					const missingRequirements = [
						...(hasDescription ? [] : ['Description']),
						...(hasInfo ? [] : ['Info']),
						...(hasTest ? [] : ['Test']),
					];

					if (leadingComments.length < minComments || missingRequirements.length > 0) {
						context.report({
							node: child,
							messageId: 'invalidComments',
							data: {
								minComments: String(minComments),
								missing: missingRequirements.length === 0
									? ''
									: ` Missing: ${missingRequirements.join(', ')}.`,
							},
						});
					}
				}
			},
		};
	},
};

export default cssTopLevelSelectorComments;
