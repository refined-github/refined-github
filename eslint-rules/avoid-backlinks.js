// Issue and PR links of other repos must go through `togithub.com` to avoid leaving backlinks there. Owners we maintain are fine, and so are TODOs.
const externalIssueOrPrUrl =
	/https:\/\/github\.com(?=\/(?!(?:refined-github|fregante|sindresorhus)\/)[^\s/]+\/[^\s/]+\/(?:issues|pull)\/\d)/g;

/** @type {import('eslint').Rule.RuleModule} */
const avoidBacklinks = {
	meta: {
		type: 'problem',
		fixable: 'code',
		schema: [],
		messages: {
			useTogithub:
				'Links to issues and PRs outside `refined-github` must use `togithub.com` instead of `github.com` to avoid backlinks.',
		},
	},
	create(context) {
		const {sourceCode} = context;

		function check() {
			// CSS source code has `comments`, JS has `getAllComments()`
			for (const comment of sourceCode.getAllComments?.() ?? sourceCode.comments ?? []) {
				if (/^\s*TODO\b/.test(comment.value)) {
					continue;
				}

				const [start] = comment.range ?? [comment.loc.start.offset];
				for (const match of sourceCode.getText(comment).matchAll(externalIssueOrPrUrl)) {
					context.report({
						loc: comment.loc,
						messageId: 'useTogithub',
						fix: fixer =>
							fixer.replaceTextRange([start + match.index, start + match.index + match[0].length], 'https://togithub.com'),
					});
				}
			}
		}

		return {Program: check, StyleSheet: check};
	},
};

export default avoidBacklinks;
