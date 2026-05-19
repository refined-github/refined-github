/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		schema: [
			{type: 'string'},
			{type: 'string'},
		],
	},
	create(context) {
		const [selector, message] = context.options;
		return {
			[selector](node) {
				context.report({
					node,
					message,
				});
			},
		};
	},
};

const byo = {
	rules: new Proxy({}, {
		get(_target, property) {
			if (typeof property === 'string') {
				return rule;
			}
		},
		has(_target, property) {
			return typeof property === 'string';
		},
	}),
};

export default byo;
