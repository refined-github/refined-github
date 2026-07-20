const restrictedSyntax = {
	'byo/use-clsx-cx': ['error', {
		selector: 'JSXAttribute[name.name="className"] > JSXExpressionContainer > TemplateLiteral',
		message: 'Use `cx()` from clsx instead of template literals in className',
	}, {
		selector: 'JSXAttribute[name.name="className"] > JSXExpressionContainer > BinaryExpression[operator="+"]',
		message: 'Use `cx()` from clsx instead of string concatenation in className',
	}],
	'byo/clsx-import-as-cx': ['error', {
		selector: 'ImportDeclaration[source.value="clsx"] > ImportDefaultSpecifier:not([local.name="cx"])',
		message: "Import clsx as `cx`: `import cx from 'clsx'`",
	}],
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
	'byo/prefer-tooltipped': ['error', {
		selector:
			'JSXOpeningElement:has(JSXAttribute[name.name="data-hotkey"]) > JSXAttribute[name.name=/^(title|aria-label)$/]',
		message:
			"Elements with hotkeys require a mention in the tooltip, which requires: import addTooltip from '../helpers/tooltip.js';",
	}, {
		message: 'JSX elements with `data-hotkey` must be wrapped in `tooltipped()` or use `withTooltipRef()`',
		selector:
			'JSXOpeningElement:not(:has(JSXAttribute[name.name="hidden"])):not(:has(JSXAttribute[name.name="ref"] JSXExpressionContainer > CallExpression[callee.name="withTooltipRef"])) > JSXAttribute[name.name="data-hotkey"]:not(CallExpression[callee.name="tooltipped"] JSXAttribute[name.name="data-hotkey"])',
	}],
	'byo/prefer-safe-create-tab': ['error', {
		message: 'Import safeCreateTab instead',
		selector:
			'CallExpression[callee.object.object.name="chrome"][callee.object.property.name="tabs"][callee.property.name="create"]',
	}],
	'byo/import-dom-chef': ['error', {
		message: "Use this instead: import React from 'dom-chef'",
		selector: 'ImportDeclaration[source.value="react"]',
	}],
	'byo/no-inline-functions': ['error', {
		selector:
			"CallExpression[callee.name='delegate'] > :matches(ArrowFunctionExpression, FunctionExpression, CallExpression)",
		message: 'Pass a callback reference, not an inline function or the result of a function call.',
	}],
};

export default restrictedSyntax;
