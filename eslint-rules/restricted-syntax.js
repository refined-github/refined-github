const restrictedSyntax = {
	'byo/selectors-array-for-complex-strings': ['error', {
		selector:
			':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=$optional], [callee.name=closestElement], [callee.name=closestElementOptional], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll])[arguments.0.value=/,/][arguments.0.value.length>=20]:not([arguments.0.value=/:has|:is|:not/])',
		message: 'Instead of a single string, pass an array of selectors and add comments to each selector',
	}],
	'byo/selectors-string-for-single-array-item': ['error', {
		selector:
			':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=$optional], [callee.name=closestElement], [callee.name=closestElementOptional], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll])[arguments.0.type=ArrayExpression][arguments.0.elements.length=1]:not([arguments.0.value=/:has|:is/])',
		message: "If it's a single selector, use a single string instead of an array",
	}],
	'byo/no-non-null-optional': ['error', {
		selector: 'TSNonNullExpression > CallExpression > [name=$optional]',
		message: 'Use `$()` instead of non-null `$optional()`. Use it as `import {expectElement as $}`',
	}],
	'byo/no-non-null-expect-element': ['error', {
		selector: 'TSNonNullExpression > CallExpression > [name=$]',
		message: 'Unused null expression: !',
	}],
	'byo/no-non-null-closest': ['error', {
		selector: 'TSNonNullExpression > CallExpression > [name=closestElement]',
		message: 'Unused null expression: ! — closestElement() already throws when the element is not found',
	}],
	'byo/init-once': ['error', {
		message: 'Init functions wrapped with onetime() must have a name ending with "Once"',
		selector:
			'ObjectExpression > Property[key.name=init] > CallExpression[callee.name=onetime]:not([arguments.0.name=/Once$/])',
	}, {
		message:
			'Init functions that run once, cannot accept a signal: https://github.com/refined-github/refined-github/pull/8072',
		selector: 'FunctionDeclaration[id.name=/Once$/] > Identifier[name=signal]',
	}],
	'byo/prefer-element-exists': ['error', {
		message: 'Use `elementExists` for checking if an element exists',
		selector: '*[test.type="CallExpression"][test.callee.name="$optional"],'
			+ '*[test.type="UnaryExpression"][test.operator="!"][test.argument.type="CallExpression"][test.argument.callee.name="$optional"]',
	}],
	'byo/data-hotkey-imports-tooltip': ['error', {
		message: 'JSX elements with `data-hotkey` must import `tooltip.js`',
		selector: String.raw`Program:has(JSXAttribute[name.name="data-hotkey"])
			:not(:has(ImportDeclaration[source.value=/\/helpers\/tooltip\.js$/]))`,
	}],
};

export default restrictedSyntax;
