import path from 'node:path';

const minInnerLength = 14;
const helperFile = 'source/helpers/css-selectors.js';
const skippedParents = new Set([
	'ImportDeclaration',
	'ExportNamedDeclaration',
	'ExportAllDeclaration',
	'ImportExpression',
	'JSXAttribute',
	'TSLiteralType',
	'TSEnumMember',
	'TSModuleDeclaration',
]);
const unwrappedParents = new Set([
	'VariableDeclarator',
	'ArrayExpression',
	'Property',
	'CallExpression',
	'NewExpression',
	'ReturnStatement',
	'ExpressionStatement',
	'ExportDefaultDeclaration',
	'AssignmentExpression',
	'JSXExpressionContainer',
	'ArrowFunctionExpression',
]);

// Walks `text` and calls `visit(character, index, depth)` for every character outside of quotes
function walk(text, from, visit) {
	let depth = 0;
	let quote;
	let escaped = false;
	for (let index = from; index < text.length; index++) {
		const character = text[index];
		if (quote) {
			if (escaped) {
				escaped = false;
			} else if (character === '\\') {
				escaped = true;
			} else if (character === quote) {
				quote = undefined;
			}
		} else if (character === '"' || character === "'") {
			quote = character;
		} else {
			if (visit(character, index, depth) === false) {
				return;
			}

			if (character === '(' || character === '[') {
				depth++;
			} else if (character === ')' || character === ']') {
				depth--;
			}
		}
	}
}

function findClosingParenthesis(text, from) {
	let closing = -1;
	walk(text, from, (character, index, depth) => {
		if (!(character === ')' && depth === 0)) {
			return;
		}

		closing = index;
		return false;
	});
	return closing;
}

function splitArguments(text) {
	const parts = [];
	let start = 0;
	walk(text, 0, (character, index, depth) => {
		if (!(character === ',' && depth === 0)) {
			return;
		}

		parts.push(text.slice(start, index));
		start = index + 1;
	});
	parts.push(text.slice(start));
	return parts.map(part => part.trim()).filter(Boolean);
}

function findMatches(value) {
	const matches = [];
	const pattern = /:(?<name>is|has|not)\(/g;
	for (let match = pattern.exec(value); match; match = pattern.exec(value)) {
		const innerStart = match.index + match[0].length;
		const closing = findClosingParenthesis(value, innerStart);
		if (closing === -1) {
			continue;
		}

		// Nested functions are handled in the next pass, once their parent has been converted
		pattern.lastIndex = closing + 1;
		const inner = value.slice(innerStart, closing);
		if (inner.length >= minInnerLength) {
			matches.push({
				name: match.groups.name,
				start: match.index,
				end: closing + 1,
				args: splitArguments(inner),
			});
		}
	}

	return matches;
}

const toLiteral = text => /[\n'\\]/.test(text) ? JSON.stringify(text) : `'${text}'`;

/** @type {import('eslint').Rule.RuleModule} */
const preferSelectorHelper = {
	meta: {
		type: 'suggestion',
		fixable: 'code',
		schema: [],
		messages: {
			useHelper: 'Use `{{name}}()` from `helpers/css-selectors.js` instead of writing `:{{name}}()` in a string',
		},
	},

	create(context) {
		const {sourceCode} = context;

		function getImportFix(fixer, names) {
			const {body} = sourceCode.ast;
			const existing = body.find(node =>
				node.type === 'ImportDeclaration' && node.source.value.endsWith('/css-selectors.js')
			);
			if (existing) {
				const imported = new Set(existing.specifiers.map(specifier => specifier.local.name));
				const missing = names.filter(name => !imported.has(name));
				if (missing.length === 0) {
					return [];
				}

				const last = existing.specifiers.findLast(specifier => specifier.type === 'ImportSpecifier');
				return last
					? [fixer.insertTextAfter(last, `, ${missing.join(', ')}`)]
					: [];
			}

			const relative = path
				.relative(path.dirname(context.filename), path.join(context.cwd, helperFile))
				.replaceAll('\\', '/');
			const source = relative.startsWith('.') ? relative : `./${relative}`;
			const statement = `import {${names.join(', ')}} from '${source}';`;
			const lastImport = body.findLast(node => node.type === 'ImportDeclaration');
			return [
				lastImport
					? fixer.insertTextAfter(lastImport, `\n${statement}`)
					: fixer.insertTextBefore(body[0], `${statement}\n`),
			];
		}

		return {
			// Template literals are intentionally ignored: their expressions can't be safely converted
			Literal(node) {
				if (typeof node.value !== 'string' || skippedParents.has(node.parent.type)) {
					return;
				}

				if (node.parent.type === 'Property' && node.parent.key === node) {
					return;
				}

				if (
					node.parent.type === 'TSAsExpression' && node.parent.typeAnnotation.type === 'TSTypeReference'
					&& node.parent.typeAnnotation.typeName.name === 'const'
				) {
					return;
				}

				const matches = findMatches(node.value);
				if (matches.length === 0) {
					return;
				}

				const parts = [];
				let position = 0;
				for (const {name, start, end, args} of matches) {
					if (start > position) {
						parts.push(toLiteral(node.value.slice(position, start)));
					}

					parts.push(`${name}(${args.map(argument => toLiteral(argument)).join(', ')})`);
					position = end;
				}

				if (position < node.value.length) {
					parts.push(toLiteral(node.value.slice(position)));
				}

				const names = [...new Set(matches.map(match => match.name))].toSorted((a, b) => a.localeCompare(b));
				const expression = parts.join(' + ');
				const isWrapped = sourceCode.getTokenBefore(node)?.value === '(' && sourceCode.getTokenAfter(node)?.value === ')';
				const text = !isWrapped && parts.length > 1 && !unwrappedParents.has(node.parent.type)
					? `(${expression})`
					: expression;

				context.report({
					node,
					messageId: 'useHelper',
					data: {name: matches[0].name},
					fix: fixer => [
						fixer.replaceText(node, text),
						...getImportFix(fixer, names),
					],
				});
			},
		};
	},
};

export default preferSelectorHelper;
