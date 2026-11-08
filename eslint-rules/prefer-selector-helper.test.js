import {run} from 'eslint-vitest-rule-tester';
import path from 'node:path';
import process from 'node:process';

import rule from './prefer-selector-helper.js';

const cwd = process.cwd();
const filename = path.join(cwd, 'source/features/example.tsx');
const importLine = "import {is} from '../helpers/css-selectors.js';";

run({
	name: 'prefer-selector-helper',
	rule,
	configs: {
		languageOptions: {
			parserOptions: {ecmaFeatures: {jsx: true}},
		},
	},
	valid: [
		// Short functions are fine
		{code: "const a = 'a:is(.foo)';", filename, cwd},
		{code: "const a = 'a:not(.foo, .bar)';", filename, cwd},
		// No functions
		{code: "const a = 'a.foo';", filename, cwd},
		// Template literals are ignored
		{code: 'const a = `a:is(.foo-element, .bar-element)`;', filename, cwd},
		// Not strings
		{code: "import a from ':is(.foo-element, .bar-element)';", filename, cwd},
	],
	invalid: [
		{
			code: "const a = ':is(.foo-element, .bar-element)';",
			filename,
			cwd,
			output: `${importLine}\nconst a = is('.foo-element', '.bar-element');`,
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: "const a = 'a:has(.foo-element > .bar-element)';",
			filename,
			cwd,
			output: "import {has} from '../helpers/css-selectors.js';\nconst a = 'a' + has('.foo-element > .bar-element');",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: 'const a = \'div:not([href^="/"], [hidden]) span\';',
			filename,
			cwd,
			output:
				"import {not} from '../helpers/css-selectors.js';\nconst a = 'div' + not('[href^=\"/\"]', '[hidden]') + ' span';",
			errors: [{messageId: 'useHelper'}],
		},
		{
			// Commas and parentheses inside attribute strings don't split arguments
			code: 'const a = \':is([title="a, b"], [data-x=")"])\';',
			filename,
			cwd,
			output: "import {is} from '../helpers/css-selectors.js';\nconst a = is('[title=\"a, b\"]', '[data-x=\")\"]');",
			errors: [{messageId: 'useHelper'}],
		},
		{
			// Existing import is extended
			code: "import {not} from '../helpers/css-selectors.js';\nconst a = ':is(.foo-element, .bar-element)';",
			filename,
			cwd,
			output: "import {not, is} from '../helpers/css-selectors.js';\nconst a = is('.foo-element', '.bar-element');",
			errors: [{messageId: 'useHelper'}],
		},
		{
			// Parentheses are added when concatenation would change precedence
			code: "const a = 'a:is(.foo-element, .bar-element)'.length;",
			filename,
			cwd,
			output:
				"import {is} from '../helpers/css-selectors.js';\nconst a = ('a' + is('.foo-element', '.bar-element')).length;",
			errors: [{messageId: 'useHelper'}],
		},
		{
			// Existing parentheses are reused
			code: "const a = ('a:is(.foo-element, .bar-element)').length;",
			filename,
			cwd,
			output:
				"import {is} from '../helpers/css-selectors.js';\nconst a = ('a' + is('.foo-element', '.bar-element')).length;",
			errors: [{messageId: 'useHelper'}],
		},
	],
});
