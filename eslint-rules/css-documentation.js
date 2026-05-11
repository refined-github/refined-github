/** @type {import('eslint').Rule.RuleModule} */
const cssDocumentation = {
	meta: {
		type: 'suggestion',
		schema: [],
		messages: {
			invalidComments: [
				'Each rule must be documented. Use `:root` with nested selectors if your fix involves multiple rules.',
				'The documentation must follow this format:',
				'/* A description of the issue */',
				'/* Info: <URL to more info> */',
				'/* Test: <URL where this issue can be seen> */{{missing}}',
			].join('\n'),
		},
	},
	create(context) {
		const {sourceCode} = context;
		const commentsByEndLine = new Map();
		for (const comment of sourceCode.comments ?? []) {
			commentsByEndLine.set(comment.loc.end.line, comment);
		}

		const isNonDescriptionMetadataLine = comment => {
			const normalizedComment = comment.toLowerCase();
			return normalizedComment.startsWith('info:') || normalizedComment.startsWith('test:');
		};

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
						hasDescription ||= commentValue.length > 0 && !isNonDescriptionMetadataLine(commentValue);
					}

					const missingRequirements = [];
					if (!hasDescription) {
						missingRequirements.push('Description');
					}

					if (!hasInfo) {
						missingRequirements.push('Info');
					}

					if (!hasTest) {
						missingRequirements.push('Test');
					}

					if (missingRequirements.length > 0) {
						context.report({
							node: child,
							messageId: 'invalidComments',
							data: {
								missing: ` Missing: ${missingRequirements.join(', ')}.`,
							},
						});
					}
				}
			},
		};
	},
};

export default cssDocumentation;
