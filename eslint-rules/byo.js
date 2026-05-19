/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		schema: [
			{
				type: 'object',
				properties: {
					selector: {type: 'string'},
					message: {type: 'string'},
				},
				required: ['selector', 'message'],
				additionalProperties: false,
			},
		],
	},
	create(context) {
		const [options] = context.options;
		const {selector, message} = options ?? {};
		if (typeof selector !== 'string' || typeof message !== 'string') {
			return {};
		}

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

			return undefined;
		},
		has(_target, property) {
			return typeof property === 'string';
		},
	}),
};

export default byo;
