import {run} from 'eslint-vitest-rule-tester';
import path from 'node:path';
import process from 'node:process';

import rule from './prefer-selector-helper.js';

const cwd = process.cwd();
const filename = path.join(cwd, 'source/features/example.tsx');

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
		{code: "const a = 'a:is(.foo, .bar)';", filename, cwd},
		// Single-item functions are fine
		{code: "const a = 'a:not(.foo-element-with-long-name)';", filename, cwd},
		{code: "const a = 'a:has(.foo-element > .bar-element)';", filename, cwd},
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
			output: "import {is} from '../helpers/css-selectors.js';\nconst a = is(\n'.foo-element',\n'.bar-element'\n);",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: "const a = 'a:has(.foo-element > .bar, .baz-element)';",
			filename,
			cwd,
			output:
				"import {has} from '../helpers/css-selectors.js';\nconst a = 'a' + has(\n'.foo-element > .bar',\n'.baz-element'\n);",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: 'const a = \'div:not([href^="/"], [hidden]) span\';',
			filename,
			cwd,
			output:
				"import {not} from '../helpers/css-selectors.js';\nconst a = 'div' + not(\n'[href^=\"/\"]',\n'[hidden]'\n) + ' span';",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: 'const a = \':is([title="a, b"], [data-x=")"])\';',
			filename,
			cwd,
			output: "import {is} from '../helpers/css-selectors.js';\nconst a = is(\n'[title=\"a, b\"]',\n'[data-x=\")\"]'\n);",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: "import {not} from '../helpers/css-selectors.js';\nconst a = ':is(.foo-element, .bar-element)';",
			filename,
			cwd,
			output: "import {not, is} from '../helpers/css-selectors.js';\nconst a = is(\n'.foo-element',\n'.bar-element'\n);",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: "const a = 'a:is(.foo-element, .bar-element)'.length;",
			filename,
			cwd,
			output:
				"import {is} from '../helpers/css-selectors.js';\nconst a = ('a' + is(\n'.foo-element',\n'.bar-element'\n)).length;",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: "const a = ('a:is(.foo-element, .bar-element)').length;",
			filename,
			cwd,
			output:
				"import {is} from '../helpers/css-selectors.js';\nconst a = ('a' + is(\n'.foo-element',\n'.bar-element'\n)).length;",
			errors: [{messageId: 'useHelper'}],
		},
		{
			code: "const a = ':has(:is(.foo-element, .bar-element))';",
			filename,
			cwd,
			output:
				"import {is} from '../helpers/css-selectors.js';\nconst a = ':has(' + is(\n'.foo-element',\n'.bar-element'\n) + ')';",
			errors: [{messageId: 'useHelper'}],
		},
	],
});
