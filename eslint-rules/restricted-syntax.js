const restrictedSyntax = [
	{
		selector:
			':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=$optional], [callee.name=$closest], [callee.name=$closestOptional], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll])[arguments.0.value=/,/][arguments.0.value.length>=20]:not([arguments.0.value=/:has|:is|:not/])',
		message: 'Instead of a single string, pass an array of selectors and add comments to each selector',
	},
	{
		selector:
			':matches([callee.name=delegate], [callee.name=$], [callee.name=$$], [callee.name=$optional], [callee.name=$closest], [callee.name=$closestOptional], [callee.name=observe], [callee.property.name=querySelector], [callee.property.name=querySelectorAll])[arguments.0.type=ArrayExpression][arguments.0.elements.length=1]:not([arguments.0.value=/:has|:is/])',
		message: "If it's a single selector, use a single string instead of an array",
	},
	{
		selector: 'TSNonNullExpression > CallExpression > [name=$optional]',
		message: 'Use `$()` instead of non-null `$optional()`. Use it as `import {expectElement as $}`',
	},
	{
		selector: 'TSNonNullExpression > CallExpression > [name=$]',
		message: 'Unused null expression: !',
	},
	{
		selector: 'TSNonNullExpression > CallExpression > [name=$closest]',
		message: 'Unused null expression: ! — $closest() already throws when the element is not found',
	},
	{
		message: 'Init functions wrapped with onetime() must have a name ending with "Once"',
		selector:
			'ObjectExpression > Property[key.name=init] > CallExpression[callee.name=onetime]:not([arguments.0.name=/Once$/])',
	},
	{
		message:
			'Init functions that run once, cannot accept a signal: https://github.com/refined-github/refined-github/pull/8072',
		selector: 'FunctionDeclaration[id.name=/Once$/] > Identifier[name=signal]',
	},
	{
		message: 'Elements with data-hotkey must have a title or aria-label in the format "Hotkey: <key>"',
		selector: 'JSXOpeningElement:has(JSXAttribute[name.name="data-hotkey"])'
			+ ':not(:has(JSXAttribute[name.name="title"]))'
			+ ':not(:has(JSXAttribute[name.name="aria-label"]))'
			+ ':not(:has(JSXAttribute[name.name="hidden"]))',
	},
	{
		message: 'Use `elementExists` for checking if an element exists',
		selector: '*[test.type="CallExpression"][test.callee.name="$optional"],'
			+ '*[test.type="UnaryExpression"][test.operator="!"][test.argument.type="CallExpression"][test.argument.callee.name="$optional"]',
	},
];

export default restrictedSyntax;
