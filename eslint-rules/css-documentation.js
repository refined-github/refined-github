// Issue and PR links of other repos must go through `togithub.com` to avoid leaving backlinks there
const externalIssueOrPrUrlRegex = /https:\/\/github\.com\/(?!refined-github\/)[^\s/]+\/[^\s/]+\/(?:issues|pull)\/\d\S*/;

/** @type {import('eslint').Rule.RuleModule} */
const cssDocumentation = {
	meta: {
		type: 'suggestion',
		schema: [],
		messages: {
			invalidComments: [
				'Each rule must be documented. Use `:root` with nested selectors if your fix involves multiple rules.',
				'Missing: {{missing}}',
				'',
				'The documentation must follow this format:',
				'/* A description of the issue */',
				'/* Info: <URL to more info> */',
				'/* Test: <URL where this issue can be seen> */',
			].join('\n'),
			externalTestUrl:
				'Test URLs to issues and PRs outside `refined-github` must use `togithub.com` instead of `github.com` to avoid backlinks: {{url}}',
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

						const externalUrl = commentValue.startsWith('test:') && externalIssueOrPrUrlRegex.exec(comment.value)?.[0];
						if (externalUrl) {
							context.report({
								loc: comment.loc,
								messageId: 'externalTestUrl',
								data: {url: externalUrl},
							});
						}

						hasDescription ||= commentValue.length > 0 && !isNonDescriptionMetadataLine(commentValue);
					}

					const missingRequirements = [
						!hasDescription && 'Description',
						!hasInfo && 'Info',
						!hasTest && 'Test',
					].filter(Boolean);

					if (missingRequirements.length > 0) {
						context.report({
							node: child,
							messageId: 'invalidComments',
							data: {
								missing: missingRequirements.join(', '),
							},
						});
					}
				}
			},
		};
	},
};

export default cssDocumentation;
