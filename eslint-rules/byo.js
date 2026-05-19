/** @type {import('eslint').Rule.RuleModule} */
const rule = {
	meta: {
		type: 'problem',
		schema: {
			type: 'array',
			minItems: 1,
			items: {
				type: 'object',
				properties: {
					selector: {type: 'string'},
					message: {type: 'string'},
				},
				required: ['selector', 'message'],
				additionalProperties: false,
			},
		},
	},
	create(context) {
		/** @type {Map<string, string[]>} */
		const messagesBySelector = new Map();
		for (const option of context.options) {
			const {selector, message} = option ?? {};
			if (typeof selector !== 'string' || typeof message !== 'string') {
				continue;
			}

			const messages = messagesBySelector.get(selector) ?? [];
			messages.push(message);
			messagesBySelector.set(selector, messages);
		}

		return Object.fromEntries(
			[...messagesBySelector.entries()].map(([selector, messages]) => [
				selector,
				(node) => {
					for (const message of messages) {
						context.report({
							node,
							message,
						});
					}
				},
			]),
		);
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
