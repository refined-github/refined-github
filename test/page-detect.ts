// TODO: resolve this exception. AVA doesn't run without reference
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../source/globals.d.ts" />

import test from 'ava';
import stripIndent from 'strip-indent';
import './fixtures/globals';
import * as pageDetect from '../source/libs/page-detect';

const allUrls = new Set<string>();
for (const imported of Object.values(pageDetect)) {
	if (Array.isArray(imported)) {
		for (const url of imported) {
			allUrls.add(url);
		}
	}
}

for (const [key, detect] of Object.entries(pageDetect)) {
	if (key.startsWith('_') || typeof detect !== 'function') {
		continue;
	}

	const testsKey = '_' + key;
	// @ts-ignore `import-all` has no index signature https://github.com/Microsoft/TypeScript/issues/16248
	const validURLs = pageDetect[testsKey] as string[] | string;

	if (validURLs === 'skip') {
		continue;
	}

	test(key, t => {
		t.true(Array.isArray(validURLs), `The function \`${key}\` doesn’t have any tests. Export an array of valid URLs as \`${testsKey}\``);
	});

	let i = 0;
	for (const url of validURLs) {
		test(`${key} ${++i}`, t => {
			location.href = url;
			t.true(detect(), stripIndent(`
				Is this URL \`${key}\`?
					${url.replace('https://github.com', '')}

				• Yes? The \`${key}\` test is wrong and should be fixed.
				• No? Remove it to the \`_${key}\` array.
			`));
		});
	}

	// @ts-ignore `import-all` has no index signature https://github.com/Microsoft/TypeScript/issues/16248
	if (pageDetect[testsKey + 'SkipNegatives']) {
		continue;
	}

	for (const url of allUrls) {
		if (!validURLs.includes(url)) {
			test(`${key} ${++i}`, t => {
				location.href = url;
				t.false(detect(), stripIndent(`
					Is this URL \`${key}\`?
						${url.replace('https://github.com', '')}

					• Yes? Add it to the \`_${key}\` array.
					• No? The \`${key}\` test is wrong and should be fixed.
				`));
			});
		}
	}
}

test('is404', t => {
	document.title = 'Page not found · GitHub';
	t.true(pageDetect.is404());

	document.title = 'examples/404: Page not found examples';
	t.false(pageDetect.is404());

	document.title = 'Dashboard';
	t.false(pageDetect.is404());

	document.title = 'Page not found · Issue #266 · sintaxi/surge · GitHub';
	t.false(pageDetect.is404());
});

test('is500', t => {
	document.title = 'Server Error · GitHub';
	t.true(pageDetect.is500());

	document.title = 'Unicorn! · GitHub';
	t.true(pageDetect.is500());

	document.title = 'examples/500: Server Error examples';
	t.false(pageDetect.is500());

	document.title = 'sindresorhus/unicorn: You can’t tell what doesn’t exist';
	t.false(pageDetect.is500());

	document.title = 'Dashboard';
	t.false(pageDetect.is500());

	document.title = 'Server Error · Issue #266 · sintaxi/surge · GitHub';
	t.false(pageDetect.is500());
});
