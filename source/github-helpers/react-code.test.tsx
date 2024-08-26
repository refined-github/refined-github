/* eslint-disable unicorn/template-indent */
// @vitest-environment happy-dom

import React from 'dom-chef';
import {test, expect} from 'vitest';

import {splitText} from './react-code.js';

test('splitText', () => {
	const line = (
		<div>
			<span data-code-text="  "/>
			<span className="pl-s" data-code-text="'https://github.com/orgs/test/dashboard'"/>
			<span className="pl-kos" data-code-text=","/>
		</div>
	);
	const found = splitText(line, 'https://github.com/orgs/test/dashboard');

	expect(found).toMatchInlineSnapshot(`
		[
		  <span
		    class="pl-s"
		    data-code-text="https://github.com/orgs/test/dashboard"
		  />,
		]
	`);
	expect(line).toMatchInlineSnapshot(`
		<div>
		  <span
		    data-code-text="  "
		  />
		  <span
		    class="pl-s"
		    data-code-text="'"
		  />
		  <span
		    class="pl-s"
		    data-code-text="https://github.com/orgs/test/dashboard"
		  />
		  <span
		    class="pl-s"
		    data-code-text="'"
		  />
		  <span
		    class="pl-kos"
		    data-code-text=","
		  />
		</div>
	`);
});

test('splitText with textContent', () => {
	const line = (
		<div>	<span className="pl-s">'https://github.com/orgs/test/dashboard'</span><span className="pl-kos">,</span></div>
	);
	const found = splitText(line, 'https://github.com/orgs/test/dashboard');

	expect(found).toMatchInlineSnapshot(`
		[
		  <span
		    class="pl-s"
		  >
		    https://github.com/orgs/test/dashboard
		  </span>,
		]
	`);
	expect(line).toMatchInlineSnapshot(`
		<div>
		  	
		  <span
		    class="pl-s"
		  >
		    '
		  </span>
		  <span
		    class="pl-s"
		  >
		    https://github.com/orgs/test/dashboard
		  </span>
		  <span
		    class="pl-s"
		  >
		    '
		  </span>
		  <span
		    class="pl-kos"
		  >
		    ,
		  </span>
		</div>
	`);
});
