import {parseHTML} from 'linkedom';
import {expect, test} from 'vitest';

import {shortenLink} from '../source/github-helpers/dom-formatters.js';

function shortenLinksInFragment(html: string): string {
	const {document} = parseHTML(html);

	const links = document.querySelectorAll('a');
	for (const link of links) {
		shortenLink(link);
	}

	return document.documentElement.outerHTML;
}

test('shorten link in comment text', () => {
	// https://github.com/refined-github/refined-github/issues/4565#issue-943802539
	expect(shortenLinksInFragment(`
		<td class="d-block comment-body markdown-body js-comment-body">
			<p dir="auto">
				<a href="https://github.com/darkred/test/compare/main...t2?expand=1">https://github.com/darkred/test/compare/main...t2?expand=1</a>
			</p>
		</td>
	`)).toMatchSnapshot();
});

test('avoid shortening link in code block inside comment', () => {
	// https://github.com/denosaurs/mod.land/issues/55#issue-1160032701
	expect(shortenLinksInFragment(`
		<div class="highlight highlight-source-ts">
			<pre class="rgh-linkified-code">
				<span class="pl-s">
					<a href="https://raw.githubusercontent.com/denosaurs/mod.land/master/cnames.ts" rel="noreferrer noopener" class="rgh-linkified-code">
						https://raw.githubusercontent.com/denosaurs/mod.land/master/cnames.ts
					</a>
				</span>
			</pre>
		</div>
	`)).toMatchSnapshot();
});

test('avoid shortening link in embedded file preview inside comment', () => {
	// https://github.com/refined-github/refined-github/pull/4759#issue-988481591
	expect(shortenLinksInFragment(`
		<div class="comment-body markdown-body js-comment-body soft-wrap user-select-contain d-block">
			<div class="Box Box--condensed my-2">
				<div itemprop="text" class="Box-body p-0 blob-wrapper blob-wrapper-embedded data">
					<table class="highlight tab-size mb-0 js-file-line-container" data-tab-size="8" data-paste-markdown-skip="">
						<tbody>
							<tr class="border-0">
								<td id="LC45" class="blob-code border-0 px-3 py-0 color-bg-default blob-code-inner js-file-line rgh-linkified-code">
									<span class="pl-c">//
										<a href="https://github.com/sindresorhus/refined-github/issues/522#issuecomment-311271274" rel="noreferrer noopener" class="rgh-linkified-code">
											https://github.com/sindresorhus/refined-github/issues/522#issuecomment-311271274
										</a>
									</span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	`)).toMatchSnapshot();
});

test('shorten link in review comment text', () => {
	// https://github.com/refined-github/refined-github/pull/4759#discussion_r738167140
	expect(shortenLinksInFragment(`
		<div class="comment-body markdown-body js-comment-body soft-wrap user-select-contain d-block">
			<p dir="auto">
				<a href="https://github.com/refined-github/refined-github">https://github.com/refined-github/refined-github</a>
			</p>
		</div>
	`)).toMatchSnapshot();
});

test('avoid shortening links in suggestion inside review comment', () => {
	// https://github.com/refined-github/refined-github/pull/4759#discussion_r738167140
	expect(shortenLinksInFragment(`
		<div class="comment-body markdown-body js-comment-body soft-wrap user-select-contain d-block">
			<div class="my-2 border rounded-2 js-suggested-changes-blob diff-view" id="">
				<div itemprop="text" class="blob-wrapper data file" style="margin: 0; border: none; overflow-y: visible; overflow-x: auto;">
					<table class="d-table tab-size mb-0 width-full" data-paste-markdown-skip="">
						<tbody>
							<tr class="border-0">
								<td class="border-0 px-2 py-1 blob-code-inner blob-code-addition js-blob-code-addition blob-code-marker-addition">
									https:<span class="pl-c">//github.com/refined-github/refined-github</span><span class="pl-kos"></span>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	`)).toMatchSnapshot();
});
